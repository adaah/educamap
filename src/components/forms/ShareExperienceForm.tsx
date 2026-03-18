import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { InstructorFields } from '@/components/forms/InstructorFields';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';

const availableSubjects = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Educação Física', 'Artes', 'Inglês', 'Filosofia', 'Sociologia',
  'Química', 'Física', 'Biologia',
];

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];

interface Instructor {
  name: string;
  subjects: string[];
  customSubject?: string;
  shifts?: string[];
  periods?: string[];
  additionalInfo?: string;
  saved?: boolean;
}

const instructorSchema = z.object({
  name: z.string(),
  subjects: z.array(z.string()),
  customSubject: z.string(),
  shifts: z.array(z.string()).optional(),
  periods: z.array(z.string()).optional(),
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
  saved: z.boolean(),
});

const formSchema = z.object({
  studentName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  university: z.string().trim().min(3, 'Universidade deve ter pelo menos 3 caracteres').max(100),
  course: z.string().trim().min(3, 'Curso deve ter pelo menos 3 caracteres').max(100),
  schoolId: z.string().optional(),
  newSchoolName: z.string().trim().max(200).optional(),
  newSchoolAddress: z.string().trim().max(500).optional(),
  newSchoolNeighborhood: z.string().trim().max(100).optional(),
  newSchoolNature: z.enum(['Pública', 'Particular']).optional(),
  hasContactData: z.boolean().optional(),
  schoolEmail: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  schoolPhone: z.string().trim().max(20).optional().or(z.literal('')),
  schoolWebsite: z.string().trim().max(255).optional().or(z.literal('')),
  newSchoolEmail: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  newSchoolPhone: z.string().trim().max(20).optional().or(z.literal('')),
  newSchoolWebsite: z.string().trim().max(255).optional().or(z.literal('')),
  newSchoolShifts: z.array(z.string()).optional(),
  newSchoolPeriods: z.array(z.string()).optional(),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
  instructors: z.array(instructorSchema).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface ShareExperienceFormProps {
  onSuccess: () => void;
}

export const ShareExperienceForm = ({ onSuccess }: ShareExperienceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSchool, setIsNewSchool] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<
    Omit<FormData, 'instructors'> & { instructors: Instructor[] }
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      university: '',
      course: '',
      hasContactData: false,
      schoolEmail: '',
      schoolPhone: '',
      schoolWebsite: '',
      newSchoolEmail: '',
      newSchoolPhone: '',
      newSchoolWebsite: '',
      instructors: [],
    },
  });

  function ensureInstructor(i: Partial<Instructor>): Instructor {
    return {
      name: i.name ?? '',
      subjects: i.subjects ?? [],
      customSubject: i.customSubject ?? '',
      shifts: i.shifts ?? [],
      periods: i.periods ?? [],
      additionalInfo: i.additionalInfo ?? '',
      saved: i.saved ?? false,
    };
  }

  const addInstructor = () => {
    const current = form.getValues('instructors') || [];
    // Limitar a 1 professor no formulário ShareExperienceForm
    if (current.length >= 1) {
      return;
    }
    const next: Instructor[] = [
      ...current.map(ensureInstructor),
      ensureInstructor({}),
    ];
    form.setValue('instructors', next);
  };

  const removeInstructor = (index: number) => {
    const current = form.getValues('instructors') || [];
    form.setValue('instructors', current.filter((_, i) => i !== index));
  };

  const saveInstructor = (index: number) => {
    const current = form.getValues('instructors') || [];
    // Mantido por compatibilidade, mas agora o salvamento é automático (sem botão).
    if (!current[index]?.name || !current[index]?.subjects?.length || !current[index]?.shifts?.length || !current[index]?.periods?.length) return;
  };

  const onSubmit = async (data: FormData) => {
    const validInstructors = (data.instructors || []).filter(i => 
      i.name && i.subjects.length > 0 && i.shifts && i.shifts.length > 0 && i.periods && i.periods.length > 0
    );
    if (validInstructors.length === 0) {
      toast({
        title: 'Instrutor obrigatório',
        description: 'Você deve adicionar pelo menos um professor instrutor com turno e período preenchidos.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Se marcou que tem dados e/ou contato da escola (e a escola já existe), enviar como atualização pendente
      if (!isNewSchool && data.hasContactData && data.schoolId) {
        const { error: updateError } = await supabase
          .from('pending_school_updates')
          .insert({
            school_id: data.schoolId,
            email: data.schoolEmail || null,
            phone: data.schoolPhone || null,
            website: data.schoolWebsite || null,
            shifts: data.newSchoolShifts || [],
            periods: data.newSchoolPeriods || [],
            contributor_name: data.studentName,
            contributor_position: 'Estagiário',
          });

        if (updateError) throw updateError;
      }

      // Se a escola não está no mapa, submeter também como "nova escola" (pendente)
      if (isNewSchool) {
        if (!coordinates) {
          toast({
            title: 'Validação necessária',
            description: 'Por favor, valide o endereço da escola clicando no botão de busca.',
            variant: 'destructive',
          });
          return;
        }

        const pendingSchoolInstructors = validInstructors.map((i) => ({
          name: i.name,
          subjects: i.subjects,
          shifts: i.shifts,
          periods: i.periods,
        }));

        const { error: schoolError } = await supabase
          .from('pending_schools')
          .insert({
            name: data.newSchoolName || 'Escola (nome não informado)',
            full_address: data.newSchoolAddress || '',
            neighborhood: data.newSchoolNeighborhood || '',
            nature: data.newSchoolNature || 'Pública',
            latitude: coordinates.lat,
            longitude: coordinates.lon,
            email: data.hasContactData ? (data.newSchoolEmail || null) : null,
            phone: data.hasContactData ? (data.newSchoolPhone || null) : null,
            website: data.hasContactData ? (data.newSchoolWebsite || null) : null,
            additional_info: data.additionalInfo || null,
            contributor_name: data.studentName,
            periods: data.hasContactData ? (data.newSchoolPeriods || []) : [],
            shifts: data.hasContactData ? (data.newSchoolShifts || []) : [],
            subjects: [], // Adicionado para evitar erro de campo faltante se houver
            instructors: pendingSchoolInstructors,
          });

        if (schoolError) throw schoolError;
      }

      const { error: studentError } = await supabase
        .from('pending_former_students')
        .insert({
          name: data.studentName,
          university: data.university,
          course: data.course,
          contributor_name: data.studentName,
        });

      if (studentError) throw studentError;

      // Registrar os instrutores recomendados como pendentes
      for (const instructor of validInstructors) {
        // Tratar campo 'Outros' nas disciplinas
        const finalSubjects = [...instructor.subjects];
        if (instructor.subjects.includes('Outros') && instructor.customSubject) {
          const index = finalSubjects.indexOf('Outros');
          if (index > -1) finalSubjects[index] = instructor.customSubject;
        }
        
        const subject = finalSubjects.join(', ');
        const { error: instructorError } = await supabase
          .from('pending_instructors')
          .insert({
            name: instructor.name,
            subject,
            school_id: !isNewSchool ? (data.schoolId || null) : null,
            contributor_name: data.studentName,
            school_name: isNewSchool ? (data.newSchoolName || null) : null,
            shifts: instructor.shifts || [],
            periods: instructor.periods || [],
            additional_info: data.additionalInfo || null,
          });
        if (instructorError) throw instructorError;
      }

      toast({
        title: 'Sucesso!',
        description: 'Sua experiência foi enviada e está aguardando aprovação. Obrigado pela contribuição!',
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: 'Sucesso!',
        description: 'Sua experiência foi enviada e está aguardando aprovação. Obrigado pela contribuição!',
      });
      form.reset();
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Seus Dados como Estagiário</h3>
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Universidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: UFBA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curso *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pedagogia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Dados da Escola */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Escola do Estágio</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="newSchool"
              checked={isNewSchool}
              onChange={(e) => setIsNewSchool(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="newSchool">A escola não está no mapa</Label>
          </div>
          {!isNewSchool ? (
            <>
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione a Escola *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma escola" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schoolsLoading ? (
                        <SelectItem value="loading" disabled>Carregando...</SelectItem>
                      ) : (
                        schools?.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
              {form.watch('schoolId') && (
                <FormField
                  control={form.control}
                  name="hasContactData"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                      <FormControl>
                        <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                      </FormControl>
                      <FormLabel className="font-normal">Tenho dados e/ou contato dessa escola</FormLabel>
                    </FormItem>
                  )}
                />
              )}

              {form.watch('hasContactData') && (
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schoolEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@escola.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="schoolPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(71) 3333-3333" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="schoolWebsite"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.escola.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newSchoolShifts"
                      render={() => (
                        <FormItem>
                          <FormLabel>Turnos</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            {availableShifts.map((shift) => (
                              <FormField
                                key={shift}
                                control={form.control}
                                name="newSchoolShifts"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(shift)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), shift])
                                            : field.onChange(field.value?.filter((value) => value !== shift));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{shift}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newSchoolPeriods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Períodos</FormLabel>
                          <div className="grid grid-cols-1 gap-4">
                            {availablePeriods.map((period) => (
                              <FormField
                                key={period}
                                control={form.control}
                                name="newSchoolPeriods"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(period)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), period])
                                            : field.onChange(field.value?.filter((value) => value !== period));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{period}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="newSchoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Escola *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo da escola" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newSchoolAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value || ''}
                        onChange={field.onChange}
                        onCoordinatesChange={(lat, lon) => setCoordinates({ lat, lon })}
                        onNeighborhoodChange={(neighborhood) => {
                          form.setValue('newSchoolNeighborhood', neighborhood);
                        }}
                        placeholder="Rua, número, complemento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newSchoolNeighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newSchoolNature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natureza</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pública">Pública</SelectItem>
                          <SelectItem value="Particular">Particular</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hasContactData"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                    </FormControl>
                    <FormLabel className="font-normal">Tenho dados e/ou contato dessa escola</FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasContactData') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newSchoolEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contato@escola.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newSchoolPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(71) 3333-3333" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newSchoolWebsite"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.escola.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newSchoolShifts"
                      render={() => (
                        <FormItem>
                          <FormLabel>Turnos</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            {availableShifts.map((shift) => (
                              <FormField
                                key={shift}
                                control={form.control}
                                name="newSchoolShifts"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(shift)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), shift])
                                            : field.onChange(field.value?.filter((value) => value !== shift));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{shift}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newSchoolPeriods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Períodos</FormLabel>
                          <div className="grid grid-cols-1 gap-4">
                            {availablePeriods.map((period) => (
                              <FormField
                                key={period}
                                control={form.control}
                                name="newSchoolPeriods"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(period)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), period])
                                            : field.onChange(field.value?.filter((value) => value !== period));
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{period}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Instrutores */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores *</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Recomende um professor instrutor que você teve durante o estágio
          </p>
          {form.watch('instructors')?.length === 0 && (
            <button
              type="button"
              onClick={addInstructor}
              className="w-full sm:w-auto px-4 py-2 bg-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:bg-secondary/90 transition-all"
            >
              + Adicionar Instrutor
            </button>
          )}
          {form.watch('instructors')?.length > 0 && (
            <InstructorFields
              instructors={form.watch('instructors')}
              onRemove={removeInstructor}
              form={form}
              availableSubjects={availableSubjects}
            />
          )}
        </div>
        <button
          type="submit" 
          className="w-full px-6 py-3 bg-secondary text-white font-poppins font-semibold rounded-lg hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
              Enviando...
            </>
          ) : (
            'Compartilhar Experiência'
          )}
        </button>
      </form>
    </Form>
  );
};
