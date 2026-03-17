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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const availableSubjects = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Educação Física', 'Artes', 'Inglês', 'Filosofia', 'Sociologia',
  'Química', 'Física', 'Biologia',
];

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];

const formSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
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
        allSubjects.push(data.customSubject);
      }

      const allPeriods = [...data.periods];
      if (data.customPeriod && data.periods.includes('Outros')) {
        allPeriods.push(data.customPeriod);
      }

      const { error: instructorError } = await supabase
        .from('pending_instructors')
        .insert({
          name: data.name,
          subject: allSubjects.join(', '),
          contributor_name: data.name,
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
        </div>

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
