import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
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
import { Loader2, Plus, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const availableSubjects = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Educação Física', 'Artes', 'Inglês', 'Filosofia', 'Sociologia',
  'Química', 'Física', 'Biologia',
];

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA', 'Técnico', 'Integrado Médio-Técnico', 'Outros'];

const formSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  isNewSchool: z.boolean().optional(),
  schoolId: z.string().optional(),
  newSchoolName: z.string().trim().max(200).optional(),
  newSchoolAddress: z.string().trim().max(500).optional(),
  newSchoolNeighborhood: z.string().trim().max(100).optional(),
  newSchoolNature: z.enum(['Pública', 'Particular']).optional(),
  hasContactData: z.boolean().optional(),
  newSchoolEmail: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  newSchoolPhone: z.string().trim().max(20).optional().or(z.literal('')),
  newSchoolWebsite: z.string().trim().max(255).optional().or(z.literal('')),
  schoolShifts: z.array(z.string()).optional(),
  schoolPeriods: z.array(z.string()).optional(),
  instructorSelection: z.string().optional(), // Campo para seleção de instrutor existente
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubjects: z.array(z.string()).optional().or(z.literal('')),
  shifts: z.array(z.string()).min(1, 'Selecione pelo menos um turno'),
  periods: z.array(z.string()).min(1, 'Selecione pelo menos um período'),
  customPeriods: z.array(z.string()).optional().or(z.literal('')),
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterInstructorFormProps {
  onSuccess: () => void;
}

export const RegisterInstructorForm = ({ onSuccess }: RegisterInstructorFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      isNewSchool: false,
      hasContactData: false,
      newSchoolEmail: '',
      newSchoolPhone: '',
      newSchoolWebsite: '',
      schoolShifts: [],
      schoolPeriods: [],
      instructorSelection: '',
      subjects: [],
      customSubjects: [],
      shifts: [],
      periods: [],
      customPeriods: [],
      additionalInfo: '',
    },
  });

  // Query para buscar instrutores de uma escola específica
  const { data: schoolInstructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ['school-instructors', form.watch('schoolId')],
    queryFn: async () => {
      const schoolId = form.watch('schoolId');
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('instructors')
        .select('id, name, subject')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!form.watch('schoolId'),
  });

  // Limpar seleção quando a escola for alterada
  useEffect(() => {
    const schoolId = form.watch('schoolId');
    const newSchoolName = form.watch('newSchoolName');
    
    // Se mudar a escola, limpar os campos
    if (schoolId || newSchoolName) {
      form.setValue('instructorSelection', '');
      form.setValue('name', '');
    }
  }, [form.watch('schoolId'), form.watch('newSchoolName'), form]);

  const selectExistingInstructor = (instructor: any) => {
    form.setValue('name', instructor.name);
    form.setValue('subjects', [instructor.subject]);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const allSubjects = [...data.subjects, ...data.customSubjects];

      const allPeriods = [...data.periods, ...data.customPeriods];

      // Se a escola não estiver no mapa, criar submissão como "nova escola" com este instrutor incluso
      if (data.isNewSchool) {
        if (!coordinates) {
          toast({
            title: 'Validação necessária',
            description: 'Por favor, valide o endereço da escola clicando no botão de busca.',
            variant: 'destructive',
          });
          return;
        }

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
            contributor_name: data.name,
            periods: data.schoolPeriods || [],
            shifts: data.schoolShifts || [],
            subjects: allSubjects,
            instructors: [{
              name: data.name,
              subjects: allSubjects,
              shifts: data.shifts,
              periods: allPeriods,
              additional_info: data.additionalInfo || null,
            }],
            additional_info: null,
          });

        if (schoolError) throw schoolError;
      } else {
        const { error: instructorError } = await supabase
          .from('pending_instructors')
          .insert({
            name: data.name,
            subject: allSubjects.join(', '),
            contributor_name: data.name,
            school_id: data.schoolId || null,
            shifts: data.shifts,
            periods: allPeriods,
            additional_info: data.additionalInfo || null,
          });

        if (instructorError) throw instructorError;
      }

      toast({
        title: 'Sucesso!',
        description: 'Seu cadastro foi enviado e está aguardando aprovação. Obrigado pela contribuição!',
      });
      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: 'Sucesso!',
        description: 'Seu cadastro foi enviado e está aguardando aprovação. Obrigado pela contribuição!',
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
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Escola</h3>
          <FormField
            control={form.control}
            name="isNewSchool"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                </FormControl>
                <FormLabel className="font-normal">A escola não está no mapa</FormLabel>
              </FormItem>
            )}
          />

          {!form.watch('isNewSchool') && (
            <>
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione a Escola</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma escola (opcional)" />
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

              {/* Dropdown para seleção de instrutores existentes */}
              {form.watch('schoolId') && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="instructorSelection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verifique se você já está cadastrado nesta escola</FormLabel>
                        <Select onValueChange={(value) => {
                          if (value === 'new') {
                            // Limpar nome para permitir novo cadastro
                            form.setValue('name', '');
                          } else {
                            const instructor = schoolInstructors?.find(i => i.id === value);
                            if (instructor) {
                              selectExistingInstructor(instructor);
                            }
                          }
                          field.onChange(value);
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu nome..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schoolInstructors?.map((instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id}>
                                {instructor.name} - {instructor.subject}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">Não estou listado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </>
          )}

          {/* Checkbox de dados/contato - aparece para qualquer escola (nova ou existente) */}
          {(form.watch('schoolId') || form.watch('isNewSchool')) && (
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
          )}

          {/* Seção de dados da escola - aparece quando tem dados de contato */}
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
                  name="schoolShifts"
                  render={() => (
                    <FormItem>
                      <FormLabel>Turnos</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {availableShifts.map((shift) => (
                          <FormField
                            key={shift}
                            control={form.control}
                            name="schoolShifts"
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
                  name="schoolPeriods"
                  render={() => (
                    <FormItem>
                      <FormLabel>Períodos</FormLabel>
                      <div className="grid grid-cols-1 gap-4">
                        {availablePeriods.map((period) => (
                          <FormField
                            key={period}
                            control={form.control}
                            name="schoolPeriods"
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
                      
                      {/* Períodos Personalizados - só aparece se "Outros" for selecionado */}
                      {form.watch('schoolPeriods')?.includes('Outros') && (
                        <div className="space-y-2 mt-3">
                          <FormLabel className="text-sm font-medium">Períodos Personalizados</FormLabel>
                          <FormField
                            control={form.control}
                            name="customPeriods"
                            render={({ field }) => (
                              <FormItem>
                                <div className="space-y-2">
                                  {(field.value || []).map((customPeriod, index) => (
                                    <div key={index} className="flex gap-2">
                                      <FormControl>
                                        <Input
                                          value={customPeriod}
                                          onChange={(e) => {
                                            const newPeriods = [...(field.value || [])];
                                            newPeriods[index] = e.target.value;
                                            field.onChange(newPeriods);
                                          }}
                                          placeholder="Digite um período personalizado"
                                        />
                                      </FormControl>
                                      {(field.value || []).length > 1 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newPeriods = (field.value || []).filter((_, i) => i !== index);
                                            field.onChange(newPeriods);
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newPeriods = [...(field.value || []), ''];
                                      field.onChange(newPeriods);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Período
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {form.watch('isNewSchool') && (
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

              </>
          )}
        </div>

        {/* Seção de dados do instrutor - aparece apenas após selecionar opção no dropdown */}
        {(form.watch('instructorSelection') || form.watch('newSchoolName')) && (
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-base sm:text-lg">Seus Dados</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Seu nome completo" 
                      {...field}
                      disabled={!!form.watch('instructorSelection') && form.watch('instructorSelection') !== 'new'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Dados Profissionais - aparece apenas após selecionar opção no dropdown ou nova escola */}
        {(form.watch('instructorSelection') || form.watch('newSchoolName')) && (
          <div className="space-y-4">
            <h3 className="font-poppins font-semibold text-base sm:text-lg">Dados Profissionais</h3>
            
            <div>
              <FormLabel className="mb-2 block">Disciplinas que você leciona *</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subject) => (
                  <FormField
                    key={subject}
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(subject)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), subject])
                                : field.onChange(
                                    field.value?.filter((value: string) => value !== subject)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{subject}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              {form.watch('subjects')?.includes('Outros') && (
                <div className="space-y-2 mt-3">
                  <FormLabel className="text-sm font-medium">Disciplinas Personalizadas</FormLabel>
                  <FormField
                    control={form.control}
                    name="customSubjects"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-2">
                          {(field.value || []).map((customSubject, index) => (
                            <div key={index} className="flex gap-2">
                              <FormControl>
                                <Input
                                  value={customSubject}
                                  onChange={(e) => {
                                    const newSubjects = [...(field.value || [])];
                                    newSubjects[index] = e.target.value;
                                    field.onChange(newSubjects);
                                  }}
                                  placeholder="Digite uma disciplina"
                                />
                              </FormControl>
                              {(field.value || []).length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newSubjects = (field.value || []).filter((_, i) => i !== index);
                                    field.onChange(newSubjects);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSubjects = [...(field.value || []), ''];
                              field.onChange(newSubjects);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Disciplina
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div>
              <FormLabel className="mb-2 block">Turnos que você trabalha *</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                {availableShifts.map((shift) => (
                  <FormField
                    key={shift}
                    control={form.control}
                    name="shifts"
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
            </div>

            <div>
              <FormLabel className="mb-2 block">Períodos que você trabalha *</FormLabel>
              <div className="grid grid-cols-1 gap-4">
                {availablePeriods.map((period) => (
                  <FormField
                    key={period}
                    control={form.control}
                    name="periods"
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
              {form.watch('periods')?.includes('Outros') && (
                <FormField
                  control={form.control}
                  name="customPeriods"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel>Períodos Personalizados</FormLabel>
                      <div className="space-y-2">
                        {(field.value || []).map((customPeriod, index) => (
                          <div key={index} className="flex gap-2">
                            <FormControl>
                              <Input
                                value={customPeriod}
                                onChange={(e) => {
                                  const newPeriods = [...(field.value || [])];
                                  newPeriods[index] = e.target.value;
                                  field.onChange(newPeriods);
                                }}
                                placeholder="Digite um período personalizado"
                              />
                            </FormControl>
                            {(field.value || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newPeriods = (field.value || []).filter((_, i) => i !== index);
                                  field.onChange(newPeriods);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPeriods = [...(field.value || []), ''];
                            field.onChange(newPeriods);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Período
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações Adicionais (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre sua experiência como professor..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

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
            'Cadastrar como Instrutor'
          )}
        </button>
      </form>
    </Form>
  );
};
