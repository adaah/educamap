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

interface Instructor {
  name: string;
  subjects: string[];
  customSubject?: string;
  email?: string;
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
}

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
  newSchoolNature: z.enum(['Pública', 'Particular']).optional(),
  newSchoolShifts: z.array(z.string()).optional(),
  newSchoolPeriods: z.array(z.string()).optional(),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
  
  // Informações adicionais
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
  
  // Consentimento
  consentToShareData: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar em compartilhar seus dados publicamente',
  }),
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
      studentName: '',
      university: '',
      course: '',
      studentEmail: '',
      studentLinkedin: '',
      studentInstagram: '',
      studentWhatsapp: '',
      additionalInfo: '',
      consentToShareData: false,
    },
  });

  const addInstructor = () => {
    setInstructors([...instructors, {
      name: '',
      subjects: [],
      customSubject: '',
      email: '',
      linkedin: '',
      whatsapp: '',
      instagram: '',
    }]);
  };

  const removeInstructor = (index: number) => {
    setInstructors(instructors.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    // Validar que pelo menos um instrutor foi adicionado
    if (instructors.length === 0 || !instructors.some(i => i.name && i.subjects.length > 0)) {
      toast({
        title: 'Instrutor obrigatório',
        description: 'Você deve adicionar pelo menos um professor instrutor.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Inserir ex-estagiário na tabela pending
      const { error: studentError } = await supabase
        .from('pending_former_students')
        .insert({
          name: data.studentName,
          university: data.university,
          course: data.course,
          email: data.studentEmail || null,
          linkedin: data.studentLinkedin ? `https://linkedin.com/in/${data.studentLinkedin}` : null,
          instagram: data.studentInstagram ? `https://www.instagram.com/${data.studentInstagram}` : null,
          whatsapp: data.studentWhatsapp || null,
          contributor_name: data.studentName,
          consent_to_share_data: data.consentToShareData,
        });

      if (studentError) throw studentError;

      toast({
        title: 'Sucesso!',
        description: 'Sua experiência foi enviada e está aguardando aprovação. Obrigado pela contribuição!',
      });

      form.reset();
      setInstructors([]);
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
          <h3 className="font-poppins font-semibold text-lg">Seus Dados como Ex-Estagiário</h3>
          
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
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-1 whitespace-nowrap">linkedin.com/in/</span>
                      <Input 
                        placeholder="seu-perfil" 
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
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
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-1 whitespace-nowrap">instagram.com/</span>
                      <Input 
                        placeholder="usuario" 
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/^@/, '');
                          value = value.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
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

              {/* Turnos e Períodos apenas para nova escola */}
              <div className="space-y-4">
                <h4 className="font-poppins font-semibold text-sm">Turnos Disponíveis</h4>
                <FormField
                  control={form.control}
                  name="newSchoolShifts"
                  render={() => (
                    <FormItem>
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
                <h4 className="font-poppins font-semibold text-sm">Períodos de Ensino</h4>
                <FormField
                  control={form.control}
                  name="newSchoolPeriods"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          name="newSchoolPeriods"
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
                
                {form.watch('newSchoolPeriods')?.includes('Outros') && (
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
            </>
          )}
        </div>

        {/* Instrutores */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores *</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Recomende um ou mais professores instrutores que você teve durante o estágio
          </p>
          
          <button
            type="button"
            onClick={addInstructor}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all"
          >
            + Adicionar Instrutor
          </button>

          {instructors.length > 0 && (
            <InstructorFields
              instructors={instructors}
              onAdd={addInstructor}
              onRemove={removeInstructor}
              form={form}
              availableSubjects={availableSubjects}
            />
          )}
        </div>

        {/* Consentimento */}
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
                    Concordo em compartilhar meus dados de contato publicamente *
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Seus dados de contato (email, WhatsApp, LinkedIn, Instagram) ficarão públicos no mapa e poderão ser visualizados por qualquer pessoa. Você pode solicitar a remoção desses dados a qualquer momento entrando em contato conosco.
                  </p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Informações Adicionais (Opcional)</h3>
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compartilhe sua experiência</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Como foi sua experiência de estágio nesta escola? Alguma dica para futuros estagiários?"
                    className="min-h-[100px]"
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
            'Compartilhar Experiência'
          )}
        </button>
      </form>
    </Form>
  );
};

