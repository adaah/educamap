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
import { Info } from 'lucide-react';
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
import { useAuth } from '@/hooks/useAuth';

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

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];

const formSchema = z.object({
  // Dados pessoais
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  linkedin: z.string().trim().max(255).optional().or(z.literal('')),
  instagram: z.string().trim().max(100).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  
  // Dados profissionais
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubject: z.string().trim().max(100).optional().or(z.literal('')),
  shifts: z.array(z.string()).min(1, 'Selecione pelo menos um turno'),
  periods: z.array(z.string()).min(1, 'Selecione pelo menos um período'),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
  
  // Informações adicionais
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
  consentToShareData: z.boolean().optional().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterInstructorFormProps {
  onSuccess: () => void;
}

export const RegisterInstructorForm = ({ onSuccess }: RegisterInstructorFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      linkedin: '',
      instagram: '',
      whatsapp: '',
      subjects: [],
      customSubject: '',
      shifts: [],
      periods: [],
      customPeriod: '',
      additionalInfo: '',
      consentToShareData: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Preparar todas as disciplinas (incluindo custom)
      const allSubjects = [...data.subjects];
      if (data.customSubject && data.subjects.includes('Outros')) {
        allSubjects.push(data.customSubject);
      }

      // Preparar todos os períodos (incluindo custom)
      const allPeriods = [...data.periods];
      if (data.customPeriod && data.periods.includes('Outros')) {
        allPeriods.push(data.customPeriod);
      }

      // Inserir instrutor na tabela pending
      const { error: instructorError } = await supabase
        .from('pending_instructors')
        .insert({
          name: data.name,
          subjects: allSubjects,
          shifts: data.shifts,
          periods: allPeriods,
          email: data.email || null,
          linkedin: data.linkedin ? `https://linkedin.com/in/${data.linkedin}` : null,
          instagram: data.instagram ? `https://www.instagram.com/${data.instagram}` : null,
          whatsapp: data.whatsapp || null,
          additional_info: data.additionalInfo || null,
          contributor_name: data.name,
          consent_to_share_data: data.consentToShareData,
          user_id: user?.id || null,
        });

      if (instructorError) throw instructorError;

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
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Seus Dados</h3>
          
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

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Dados de Contato (opcionais)</h4>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn (público)</FormLabel>
                  <FormControl>
                    <Input placeholder="linkedin.com/in/seuperfil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="@seuperfil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="(71) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Aviso sobre dados protegidos */}
          {(form.watch('email') || form.watch('instagram') || form.watch('whatsapp')) && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Dados de contato protegidos</p>
                <p>Essas informações ficarão protegidas e só serão disponibilizados para outros usuários caso você permita quando receberem uma solicitação de contato.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dados Profissionais */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Dados Profissionais</h3>
          
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
                                ? field.onChange([...field.value, 'Outros'])
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
                                  : field.onChange(
                                      field.value?.filter((value) => value !== shift)
                                    );
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
                                  : field.onChange(
                                      field.value?.filter((value) => value !== period)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">{period}</FormLabel>
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
                                ? field.onChange([...field.value, 'Outros'])
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
                <FormMessage />
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
                    <Input placeholder="Ex: Educação Superior, Pós-graduação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações Adicionais</FormLabel>
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
          className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
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
