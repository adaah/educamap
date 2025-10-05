import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { InstructorFields, type Instructor } from '@/components/forms/InstructorFields';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  // Dados do contribuidor (Gestor/Secretaria)
  contributorName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  contributorPosition: z.string().trim().min(3, 'Cargo deve ter pelo menos 3 caracteres').max(100),
  
  schoolId: z.string().optional(),
  newSchoolName: z.string().trim().max(200).optional(),
  newSchoolAddress: z.string().trim().max(500).optional(),
  newSchoolNeighborhood: z.string().trim().max(100).optional(),
  newSchoolNature: z.enum(['Pública', 'Particular']).optional(),
  
  email: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  website: z.string().trim().max(255).optional().or(z.literal('')),
  
  shifts: z.array(z.string()).optional(),
  periods: z.array(z.string()).optional(),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
  subjects: z.array(z.string()).optional(),
  customSubject: z.string().trim().max(100).optional().or(z.literal('')),
  
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
  
  // Consentimento (opcional para gestores, mas necessário se preencherem dados de contato)
  consentToShareData: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InstitutionalDataFormProps {
  onSuccess: () => void;
}

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];
const availableSubjects = [
  'Matemática',
  'Português',
  'Ciências',
  'História',
  'Geografia',
  'Educação Física',
  'Artes',
  'Inglês',
  'Filosofia',
  'Sociologia',
  'Química',
  'Física',
  'Biologia',
];

export const InstitutionalDataForm = ({ onSuccess }: InstitutionalDataFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSchool, setIsNewSchool] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

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
      contributorName: '',
      contributorPosition: '',
      email: '',
      phone: '',
      website: '',
      shifts: [],
      periods: [],
      customPeriod: '',
      subjects: [],
      customSubject: '',
      additionalInfo: '',
      consentToShareData: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let schoolId = data.schoolId;

      // Se for nova escola, criar primeiro
      if (isNewSchool && data.newSchoolName) {
        if (!coordinates) {
          toast({
            title: 'Validação necessária',
            description: 'Por favor, valide o endereço da nova escola.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        const { data: newSchool, error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: data.newSchoolName,
            full_address: data.newSchoolAddress || '',
            neighborhood: data.newSchoolNeighborhood || '',
            nature: data.newSchoolNature || 'Pública',
            latitude: coordinates.lat,
            longitude: coordinates.lon,
            email: data.email || null,
            phone: data.phone || null,
            website: data.website || null,
            additional_info: data.additionalInfo || null,
            contributor_name: `${data.contributorName} - ${data.contributorPosition}`,
          })
          .select()
          .single();

        if (schoolError) throw schoolError;
        schoolId = newSchool.id;
      } else if (schoolId) {
        // Atualizar dados de contato da escola existente
        const { error: updateError } = await supabase
          .from('schools')
          .update({
            email: data.email || null,
            phone: data.phone || null,
            website: data.website || null,
            additional_info: data.additionalInfo || null,
            contributor_name: `${data.contributorName} - ${data.contributorPosition}`,
          })
          .eq('id', schoolId);

        if (updateError) throw updateError;
      }

      if (!schoolId) {
        toast({
          title: 'Erro',
          description: 'Selecione uma escola ou cadastre uma nova',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar turnos
      if (data.shifts && data.shifts.length > 0) {
        await supabase.from('school_shifts').delete().eq('school_id', schoolId);
        
        const shiftsPromises = data.shifts.map((shift) =>
          supabase.from('school_shifts').insert({
            school_id: schoolId,
            shift,
          })
        );
        await Promise.all(shiftsPromises);
      }

      // Atualizar períodos
      if (data.periods && data.periods.length > 0) {
        await supabase.from('school_periods').delete().eq('school_id', schoolId);
        
        const allPeriods = [...data.periods];
        if (data.customPeriod && data.periods.includes('Outros')) {
          allPeriods.push(data.customPeriod);
        }
        const periodsPromises = allPeriods.map((period) =>
          supabase.from('school_periods').insert({
            school_id: schoolId,
            period,
          })
        );
        await Promise.all(periodsPromises);
      }

      // Atualizar disciplinas
      if (data.subjects && data.subjects.length > 0) {
        await supabase.from('school_subjects').delete().eq('school_id', schoolId);
        
        const allSubjects = [...data.subjects];
        if (data.customSubject && data.subjects.includes('Outros')) {
          allSubjects.push(data.customSubject);
        }
        const subjectsPromises = allSubjects.map((subject) =>
          supabase.from('school_subjects').insert({
            school_id: schoolId,
            subject,
          })
        );
        await Promise.all(subjectsPromises);
      }

      // Inserir instrutores opcionais
      for (const instructor of instructors) {
        if (!instructor.name || instructor.subjects.length === 0) continue;

        const finalSubjects = [...instructor.subjects];
        const showCustom = instructor.subjects.includes('Outros');
        if (showCustom && instructor.customSubject) {
          const index = finalSubjects.indexOf('Outros');
          if (index > -1) {
            finalSubjects[index] = instructor.customSubject;
          }
        }

        for (const subject of finalSubjects) {
          await supabase.from('instructors').insert({
            school_id: schoolId,
            name: instructor.name,
            subject: subject,
            email: instructor.email || null,
            linkedin: instructor.linkedin ? `https://linkedin.com/in/${instructor.linkedin}` : null,
            whatsapp: instructor.whatsapp || null,
            instagram: instructor.instagram ? `https://www.instagram.com/${instructor.instagram}` : null,
            contributor_name: `${data.contributorName} - ${data.contributorPosition}`,
          });
        }
      }

      toast({
        title: 'Sucesso!',
        description: 'Dados institucionais atualizados com sucesso.',
      });

      form.reset();
      setInstructors([]);
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Identificação do Gestor/Secretaria */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Seus Dados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contributorName"
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

            <FormField
              control={form.control}
              name="contributorPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Diretor, Coordenador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Identificação da Escola</h3>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="newSchoolInst"
              checked={isNewSchool}
              onChange={(e) => setIsNewSchool(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="newSchoolInst">Cadastrar nova escola</Label>
          </div>

          {!isNewSchool ? (
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
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Dados de Contato</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Institucional</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contato@escola.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
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
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.escola.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Turnos Disponíveis</h3>
          <FormField
            control={form.control}
            name="shifts"
            render={() => (
              <FormItem>
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
                                  : field.onChange(
                                      field.value?.filter((value) => value !== shift)
                                    );
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
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Períodos Escolares</h3>
          <FormField
            control={form.control}
            name="periods"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  : field.onChange(
                                      field.value?.filter((value) => value !== period)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{period}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField
                    key="Outros"
                    control={form.control}
                    name="periods"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes('Outros')}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), 'Outros'])
                                : field.onChange(
                                    field.value?.filter((value) => value !== 'Outros')
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Outros</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('periods')?.includes('Outros') && (
            <FormField
              control={form.control}
              name="customPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique o período</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o período" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Disciplinas/Áreas Disponíveis</h3>
          <FormField
            control={form.control}
            name="subjects"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                      field.value?.filter((value) => value !== subject)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">{subject}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField
                    key="Outros"
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes('Outros')}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), 'Outros'])
                                : field.onChange(
                                    field.value?.filter((value) => value !== 'Outros')
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Outros</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
            )}
          />
          
          {form.watch('subjects')?.includes('Outros') && (
            <FormField
              control={form.control}
              name="customSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique a disciplina/área</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a disciplina ou área" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Instrutores (Opcional) */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores (Opcional)</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Liste professores que podem ser contatos para estágio
          </p>
          
          <button
            type="button"
            onClick={() => setInstructors([...instructors, {
              name: '',
              subjects: [],
              customSubject: '',
              email: '',
              linkedin: '',
              whatsapp: '',
              instagram: '',
            }])}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all"
          >
            + Adicionar Instrutor
          </button>

          {instructors.length > 0 && (
            <InstructorFields
              instructors={instructors}
              onAdd={() => setInstructors([...instructors, {
                name: '',
                subjects: [],
                customSubject: '',
                email: '',
                linkedin: '',
                whatsapp: '',
                instagram: '',
              }])}
              onRemove={(index) => setInstructors(instructors.filter((_, i) => i !== index))}
              form={form}
              availableSubjects={availableSubjects}
            />
          )}
        </div>

        {/* Consentimento (se forneceram dados de contato) */}
        {(form.watch('email') || form.watch('phone') || instructors.some(i => i.email || i.linkedin || i.whatsapp || i.instagram)) && (
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border">
            <FormField
              control={form.control}
              name="consentToShareData"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Concordo em compartilhar os dados de contato fornecidos publicamente
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Os dados de contato fornecidos (email, telefone, dados dos professores) ficarão públicos no mapa e poderão ser visualizados por qualquer pessoa. Você pode solicitar a remoção desses dados a qualquer momento entrando em contato conosco.
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Informações Adicionais</h3>
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações sobre oportunidades de estágio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Compartilhe informações sobre como os estudantes podem entrar em contato para oportunidades de estágio..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Opcional: Processos seletivos, requisitos, contato preferencial, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <button
          type="submit" 
          className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
              Atualizando...
            </>
          ) : (
            'Atualizar Dados'
          )}
        </button>
      </form>
    </Form>
  );
};
