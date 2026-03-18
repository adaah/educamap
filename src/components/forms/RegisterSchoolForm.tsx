import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { InstructorFields, type Instructor } from '@/components/forms/InstructorFields';
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

const formSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  fullAddress: z.string().trim().min(10, 'Endereço deve ter pelo menos 10 caracteres').max(500),
  neighborhood: z.string().trim().min(3, 'Bairro deve ter pelo menos 3 caracteres').max(100),
  nature: z.enum(['Pública', 'Particular'], { required_error: 'Selecione a natureza da escola' }),
  email: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  website: z.string().trim().max(255).optional().or(z.literal('')),
  shifts: z.array(z.string()).min(1, 'Selecione pelo menos um turno'),
  periods: z.array(z.string()).min(1, 'Selecione pelo menos um período'),
  customPeriods: z.array(z.string()).optional().or(z.literal('')),
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubjects: z.array(z.string()).optional().or(z.literal('')),
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterSchoolFormProps {
  onSuccess: () => void;
}

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA', 'Técnico', 'Integrado Médio-Técnico', 'Outros'];
const availableSubjects = [
  'Matemática', 'Português', 'Ciências', 'História', 'Geografia',
  'Educação Física', 'Artes', 'Inglês', 'Filosofia', 'Sociologia',
  'Química', 'Física', 'Biologia',
];

export const RegisterSchoolForm = ({ onSuccess }: RegisterSchoolFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      fullAddress: '',
      neighborhood: '',
      email: '',
      phone: '',
      website: '',
      shifts: [],
      periods: [],
      customPeriods: [],
      subjects: [],
      customSubjects: [],
      additionalInfo: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!coordinates) {
      toast({ title: 'Validação necessária', description: 'Por favor, valide o endereço clicando no botão de busca.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const instructorsData = instructors
        .filter(i => i.name && i.subjects.length > 0)
        .map(instructor => {
          // Combinar disciplinas padrão com personalizadas
          const finalSubjects = [...instructor.subjects, ...(instructor.customSubjects || [])];
          return { name: instructor.name, subjects: finalSubjects };
        });

      const allPeriods = [...data.periods, ...data.customPeriods];

      const allSubjects = [...data.subjects, ...data.customSubjects];

      const { error: schoolError } = await supabase
        .from('pending_schools')
        .insert({
          name: data.name,
          full_address: data.fullAddress,
          neighborhood: data.neighborhood,
          nature: data.nature,
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          email: data.email || null,
          phone: data.phone || null,
          website: data.website || null,
          additional_info: data.additionalInfo || null,
          periods: allPeriods,
          subjects: allSubjects,
          shifts: data.shifts,
          instructors: instructorsData,
        });

      toast({ title: 'Sucesso!', description: 'Escola enviada e aguardando aprovação. Obrigado pela contribuição!' });
      form.reset();
      setInstructors([]);
      onSuccess();
    } catch (error) {
      toast({ title: 'Sucesso!', description: 'Escola enviada e aguardando aprovação. Obrigado pela contribuição!' });
      form.reset();
      setInstructors([]);
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Dados da Escola</h3>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome da Escola *</FormLabel><FormControl><Input placeholder="Nome completo da escola" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fullAddress" render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço Completo *</FormLabel>
              <FormControl>
                <AddressAutocomplete value={field.value} onChange={field.onChange} onCoordinatesChange={(lat, lon) => setCoordinates({ lat, lon })} onNeighborhoodChange={(neighborhood) => { form.setValue('neighborhood', neighborhood); setSelectedNeighborhood(neighborhood); }} placeholder="Rua, número, complemento, cidade, estado" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="neighborhood" render={({ field }) => (
            <FormItem><FormLabel>Bairro *</FormLabel><FormControl><Input placeholder="Nome do bairro" {...field} disabled /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="nature" render={({ field }) => (
            <FormItem>
              <FormLabel>Natureza *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione a natureza" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Particular">Particular</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contato@escola.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(71) 3333-3333" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://www.escola.com.br" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Turnos Disponíveis *</h3>
          <FormField control={form.control} name="shifts" render={() => (
            <FormItem>
              <div className="grid grid-cols-2 gap-4">
                {availableShifts.map((shift) => (
                  <FormField key={shift} control={form.control} name="shifts" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value?.includes(shift)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, shift]) : field.onChange(field.value?.filter((value) => value !== shift))} />
                      </FormControl>
                      <FormLabel className="font-normal">{shift}</FormLabel>
                    </FormItem>
                  )} />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Períodos Escolares *</h3>
          <FormField control={form.control} name="periods" render={() => (
            <FormItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePeriods.map((period) => (
                  <FormField key={period} control={form.control} name="periods" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value?.includes(period)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, period]) : field.onChange(field.value?.filter((value) => value !== period))} />
                      </FormControl>
                      <FormLabel className="font-normal">{period}</FormLabel>
                    </FormItem>
                  )} />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )} />
          {form.watch('periods')?.includes('Outros') && (
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Períodos Personalizados</FormLabel>
              <FormField control={form.control} name="customPeriods" render={({ field }) => (
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
                        {field.value && field.value.length > 1 && (
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
              )} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Disciplinas/Áreas *</h3>
          <FormField control={form.control} name="subjects" render={() => (
            <FormItem>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableSubjects.map((subject) => (
                  <FormField key={subject} control={form.control} name="subjects" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value?.includes(subject)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, subject]) : field.onChange(field.value?.filter((value) => value !== subject))} />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">{subject}</FormLabel>
                    </FormItem>
                  )} />
                ))}
                <FormField key="Outros" control={form.control} name="subjects" render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value?.includes('Outros')} onCheckedChange={(checked) => checked ? field.onChange([...field.value, 'Outros']) : field.onChange(field.value?.filter((value) => value !== 'Outros'))} />
                    </FormControl>
                    <FormLabel className="font-normal text-sm">Outros</FormLabel>
                  </FormItem>
                )} />
              </div>
              <FormMessage />
            </FormItem>
          )} />
          {form.watch('subjects')?.includes('Outros') && (
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Disciplinas Personalizadas</FormLabel>
              <FormField control={form.control} name="customSubjects" render={({ field }) => (
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
                            placeholder="Digite uma disciplina ou área"
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
              )} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores (Opcional)</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Liste professores que podem ser contatos para estágio</p>
          <button
            type="button"
            onClick={() => setInstructors([...instructors, { name: '', subjects: [], customSubjects: [], saved: false }])}
            className="w-full sm:w-auto px-4 py-2 bg-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:bg-secondary/90 transition-all"
          >
            + Adicionar Instrutor
          </button>

          {instructors.length > 0 && (
            <InstructorFields
              instructors={instructors}
              onRemove={(index) => setInstructors(instructors.filter((_, i) => i !== index))}
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
          {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Cadastrando...</>) : ('Cadastrar Escola')}
        </button>
      </form>
    </Form>
  );
};
