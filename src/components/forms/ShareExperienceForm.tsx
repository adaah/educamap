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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  // Dados do ex-estagiário
  studentName: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  university: z.string().trim().min(3, 'Universidade deve ter pelo menos 3 caracteres').max(100),
  course: z.string().trim().min(3, 'Curso deve ter pelo menos 3 caracteres').max(100),
  studentEmail: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  studentLinkedin: z.string().trim().max(255).optional().or(z.literal('')),
  studentInstagram: z.string().trim().max(100).optional().or(z.literal('')),
  studentWhatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  
  // Dados da escola
  schoolId: z.string().optional(),
  newSchoolName: z.string().trim().max(200).optional(),
  newSchoolAddress: z.string().trim().max(500).optional(),
  newSchoolNeighborhood: z.string().trim().max(100).optional(),
  
  // Dados do instrutor
  instructorName: z.string().trim().min(3, 'Nome do instrutor deve ter pelo menos 3 caracteres').max(100),
  instructorSubject: z.string().trim().min(2, 'Disciplina deve ter pelo menos 2 caracteres').max(100),
  instructorEmail: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  instructorLinkedin: z.string().trim().max(255).optional().or(z.literal('')),
  instructorWhatsapp: z.string().trim().max(20).optional().or(z.literal('')),
  instructorInstagram: z.string().trim().max(100).optional().or(z.literal('')),
  
  // Informações adicionais
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface ShareExperienceFormProps {
  onSuccess: () => void;
}

export const ShareExperienceForm = ({ onSuccess }: ShareExperienceFormProps) => {
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
      studentName: '',
      university: '',
      course: '',
      studentEmail: '',
      studentLinkedin: '',
      studentInstagram: '',
      studentWhatsapp: '',
      instructorName: '',
      instructorSubject: '',
      instructorEmail: '',
      instructorLinkedin: '',
      instructorWhatsapp: '',
      instructorInstagram: '',
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
            nature: 'Pública',
            latitude: 0,
            longitude: 0,
            additional_info: data.additionalInfo || null,
          })
          .select()
          .single();

        if (schoolError) throw schoolError;
        schoolId = newSchool.id;
      }

      if (!schoolId) {
        toast({
          title: 'Erro',
          description: 'Selecione uma escola ou cadastre uma nova',
          variant: 'destructive',
        });
        return;
      }

      // Inserir dados do ex-estagiário
      const { error: studentError } = await supabase
        .from('former_students')
        .insert({
          school_id: schoolId,
          name: data.studentName,
          university: data.university,
          course: data.course,
          email: data.studentEmail || null,
          linkedin: data.studentLinkedin || null,
          instagram: data.studentInstagram || null,
          whatsapp: data.studentWhatsapp || null,
        });

      if (studentError) throw studentError;

      // Inserir dados do instrutor
      const { error: instructorError } = await supabase
        .from('instructors')
        .insert({
          school_id: schoolId,
          name: data.instructorName,
          subject: data.instructorSubject,
          email: data.instructorEmail || null,
          linkedin: data.instructorLinkedin || null,
          whatsapp: data.instructorWhatsapp || null,
          instagram: data.instructorInstagram || null,
        });

      if (instructorError) throw instructorError;

      toast({
        title: 'Sucesso!',
        description: 'Sua experiência foi compartilhada com sucesso.',
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
        {/* Dados do Ex-Estagiário */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Seus Dados</h3>
          
          <FormField
            control={form.control}
            name="studentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="studentEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentWhatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(71) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="studentLinkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="linkedin.com/in/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentInstagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="@usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dados da Escola */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Escola do Estágio</h3>
          
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
                      <Input placeholder="Nome da escola" {...field} />
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
                      <Input placeholder="Rua, número, bairro, cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newSchoolNeighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {/* Dados do Instrutor */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Dados do Instrutor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instructorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Instrutor *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disciplina/Área *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Matemática" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instructorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorWhatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(71) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="instructorLinkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="linkedin.com/in/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructorInstagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="@usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Informações Adicionais</h3>
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações sobre a escola (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Compartilhe informações relevantes sobre a escola, oportunidades de estágio, processos seletivos, etc."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Compartilhar Experiência'
          )}
        </Button>
      </form>
    </Form>
  );
};
