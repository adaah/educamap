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
  subjects: z.array(z.string()).optional(),
  
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface InstitutionalDataFormProps {
  onSuccess: () => void;
}

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio'];
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
      email: '',
      phone: '',
      website: '',
      shifts: [],
      periods: [],
      subjects: [],
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let schoolId = data.schoolId;

      // Se for nova escola, criar primeiro
      if (isNewSchool && data.newSchoolName) {
        const { data: newSchool, error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: data.newSchoolName,
            full_address: data.newSchoolAddress || '',
            neighborhood: data.newSchoolNeighborhood || '',
            nature: data.newSchoolNature || 'Pública',
            latitude: 0,
            longitude: 0,
            email: data.email || null,
            phone: data.phone || null,
            website: data.website || null,
            additional_info: data.additionalInfo || null,
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
        
        const periodsPromises = data.periods.map((period) =>
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
        
        const subjectsPromises = data.subjects.map((subject) =>
          supabase.from('school_subjects').insert({
            school_id: schoolId,
            subject,
          })
        );
        await Promise.all(subjectsPromises);
      }

      toast({
        title: 'Sucesso!',
        description: 'Dados institucionais atualizados com sucesso.',
      });

      form.reset();
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
                      <Input placeholder="Rua, número, complemento" {...field} />
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
                        <Input placeholder="Nome do bairro" {...field} />
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
                </div>
              </FormItem>
            )}
          />
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
                </div>
              </FormItem>
            )}
          />
        </div>

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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            'Atualizar Dados'
          )}
        </Button>
      </form>
    </Form>
  );
};
