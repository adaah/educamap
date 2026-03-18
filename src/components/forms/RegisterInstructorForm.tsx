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
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const availableSubjects = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Educação Física', 'Artes', 'Inglês', 'Filosofia', 'Sociologia',
  'Química', 'Física', 'Biologia',
];

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];

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
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubject: z.string().trim().max(100).optional().or(z.literal('')),
  shifts: z.array(z.string()).min(1, 'Selecione pelo menos um turno'),
  periods: z.array(z.string()).min(1, 'Selecione pelo menos um período'),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
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
      subjects: [],
      customSubject: '',
      shifts: [],
      periods: [],
      customPeriod: '',
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const allSubjects = [...data.subjects];
      if (data.customSubject && data.subjects.includes('Outros')) {
        const idx = allSubjects.indexOf('Outros');
        if (idx > -1) allSubjects[idx] = data.customSubject;
      }

      const allPeriods = [...data.periods];
      if (data.customPeriod && data.periods.includes('Outros')) {
        const idx = allPeriods.indexOf('Outros');
        if (idx > -1) allPeriods[idx] = data.customPeriod;
      }

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
      console.error('Error submitting form:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar o formulário. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Seus Dados</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

              {/* Checkbox de dados/contato só aparece se uma escola estiver selecionada */}
              {form.watch('schoolId') && (
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
            </>
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
                      name="schoolShifts"
                      render={() => (
                        <FormItem>
                          <FormLabel>Turnos da escola (opcional)</FormLabel>
                          <div className="grid grid-cols-2 gap-3">
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
                                    <FormLabel className="font-normal text-sm">{shift}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="schoolPeriods"
                      render={() => (
                        <FormItem>
                          <FormLabel>Períodos da escola (opcional)</FormLabel>
                          <div className="grid grid-cols-2 gap-3">
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
                                    <FormLabel className="font-normal text-sm">{period}</FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Dados Profissionais</h3>
          
          <FormField
            control={form.control}
            name="subjects"
            render={() => (
              <FormItem>
                <FormLabel>Disciplinas que você leciona *</FormLabel>
                <div className="grid grid-cols-2 gap-3">
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
                                  ? field.onChange([...field.value, subject])
                                  : field.onChange(field.value?.filter((value) => value !== subject));
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
                                ? field.onChange([...field.value, 'Outros'])
                                : field.onChange(field.value?.filter((value) => value !== 'Outros'));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">Outros</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('subjects')?.includes('Outros') && (
            <FormField
              control={form.control}
              name="customSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique a disciplina</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Libras, Educação Especial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="shifts"
            render={() => (
              <FormItem>
                <FormLabel>Turnos que você trabalha *</FormLabel>
                <div className="grid grid-cols-2 gap-3">
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
                                  ? field.onChange([...field.value, shift])
                                  : field.onChange(field.value?.filter((value) => value !== shift));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">{shift}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periods"
            render={() => (
              <FormItem>
                <FormLabel>Períodos que você trabalha *</FormLabel>
                <div className="grid grid-cols-2 gap-3">
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
                                  ? field.onChange([...field.value, period])
                                  : field.onChange(field.value?.filter((value) => value !== period));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">{period}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações Adicionais (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Conte um pouco sobre sua experiência como professor..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            'Cadastrar como Instrutor'
          )}
        </button>
      </form>
    </Form>
  );
};
