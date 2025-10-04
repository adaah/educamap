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
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubject: z.string().trim().max(100).optional().or(z.literal('')),
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
      studentName: '',
      university: '',
      course: '',
      studentEmail: '',
      studentLinkedin: '',
      studentInstagram: '',
      studentWhatsapp: '',
      instructorName: '',
      subjects: [],
      customSubject: '',
      instructorEmail: '',
      instructorLinkedin: '',
      instructorWhatsapp: '',
      instructorInstagram: '',
      additionalInfo: '',
    },
  });

  const selectedSubjects = form.watch('subjects');
  const showCustomSubject = selectedSubjects.includes('Outros');

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
            nature: 'Pública',
            latitude: coordinates.lat,
            longitude: coordinates.lon,
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

      // Inserir dados do instrutor e disciplinas
      const finalSubjects = [...data.subjects];
      if (showCustomSubject && data.customSubject) {
        const index = finalSubjects.indexOf('Outros');
        if (index > -1) {
          finalSubjects[index] = data.customSubject;
        }
      }

      for (const subject of finalSubjects) {
        const { error: instructorError } = await supabase
          .from('instructors')
          .insert({
            school_id: schoolId,
            name: data.instructorName,
            subject: subject,
            email: data.instructorEmail || null,
            linkedin: data.instructorLinkedin || null,
            whatsapp: data.instructorWhatsapp || null,
            instagram: data.instructorInstagram || null,
          });

        if (instructorError) throw instructorError;

        const { error: subjectError } = await supabase
          .from('school_subjects')
          .insert({
            school_id: schoolId,
            subject: subject,
          });

        if (subjectError && subjectError.code !== '23505') throw subjectError;
      }

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
                      <AddressAutocomplete
                        value={field.value || ''}
                        onChange={field.onChange}
                        onCoordinatesChange={(lat, lon) => setCoordinates({ lat, lon })}
                        onNeighborhoodChange={(neighborhood) => {
                          form.setValue('newSchoolNeighborhood', neighborhood);
                        }}
                        placeholder="Rua, número, bairro, cidade"
                      />
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
                      <Input placeholder="Bairro" {...field} disabled />
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
            name="subjects"
            render={() => (
              <FormItem>
                <FormLabel>Disciplinas/Áreas *</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubjects.map((subject) => (
                    <FormField
                      key={subject}
                      control={form.control}
                      name="subjects"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={subject}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(subject)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, subject])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== subject
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm cursor-pointer">
                              {subject}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  
                  <FormField
                    control={form.control}
                    name="subjects"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes('Outros')}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, 'Outros'])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== 'Outros')
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer">
                            Outros
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {showCustomSubject && (
            <FormField
              control={form.control}
              name="customSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especifique a disciplina</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a disciplina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
          <h3 className="font-poppins font-semibold text-lg">Informações sobre Estágio (opcional)</h3>
          
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conte um pouco sobre sua experiência</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva sua experiência, dicas, contatos importantes..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </form>
    </Form>
  );
};
