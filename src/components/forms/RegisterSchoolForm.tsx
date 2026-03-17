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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(200),
  fullAddress: z.string().trim().min(10, 'Endereço deve ter pelo menos 10 caracteres').max(500),
  neighborhood: z.string().trim().min(3, 'Bairro deve ter pelo menos 3 caracteres').max(100),
  nature: z.enum(['Pública', 'Particular'], { required_error: 'Selecione a natureza da escola' }),
  shifts: z.array(z.string()).min(1, 'Selecione pelo menos um turno'),
  periods: z.array(z.string()).min(1, 'Selecione pelo menos um período'),
  customPeriod: z.string().trim().max(100).optional().or(z.literal('')),
  subjects: z.array(z.string()).min(1, 'Selecione pelo menos uma disciplina'),
  customSubject: z.string().trim().max(100).optional().or(z.literal('')),
  additionalInfo: z.string().trim().max(1000).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterSchoolFormProps {
  onSuccess: () => void;
}

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];
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
      shifts: [],
      periods: [],
      customPeriod: '',
      subjects: [],
      customSubject: '',
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
          const finalSubjects = [...instructor.subjects];
          const showCustom = instructor.subjects.includes('Outros');
          if (showCustom && instructor.customSubject) {
            const index = finalSubjects.indexOf('Outros');
            if (index > -1) finalSubjects[index] = instructor.customSubject;
          }
          return { name: instructor.name, subjects: finalSubjects };
        });

      const allPeriods = [...data.periods];
      if (data.customPeriod && data.periods.includes('Outros')) allPeriods.push(data.customPeriod);

      const allSubjects = [...data.subjects];
      if (data.customSubject && data.subjects.includes('Outros')) allSubjects.push(data.customSubject);

      const { error: schoolError } = await supabase
        .from('pending_schools')
        .insert({
          name: data.name,
          full_address: data.fullAddress,
          neighborhood: data.neighborhood,
          nature: data.nature,
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          additional_info: data.additionalInfo || null,
          periods: allPeriods,
          subjects: allSubjects,
          shifts: data.shifts,
          instructors: instructorsData,
        });

      if (schoolError) throw schoolError;

      toast({ title: 'Sucesso!', description: 'Escola enviada e aguardando aprovação. Obrigado pela contribuição!' });
      form.reset();
      setInstructors([]);
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ title: 'Erro', description: 'Ocorreu um erro ao cadastrar a escola. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Dados da Escola</h3>
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
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Turnos Disponíveis *</h3>
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
          <h3 className="font-poppins font-semibold text-lg">Períodos Escolares *</h3>
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
                <FormField key="Outros" control={form.control} name="periods" render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value?.includes('Outros')} onCheckedChange={(checked) => checked ? field.onChange([...field.value, 'Outros']) : field.onChange(field.value?.filter((value) => value !== 'Outros'))} />
                    </FormControl>
                    <FormLabel className="font-normal">Outros</FormLabel>
                  </FormItem>
                )} />
              </div>
              <FormMessage />
            </FormItem>
          )} />
          {form.watch('periods')?.includes('Outros') && (
            <FormField control={form.control} name="customPeriod" render={({ field }) => (
              <FormItem><FormLabel>Especifique o período</FormLabel><FormControl><Input placeholder="Digite o período" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-lg">Disciplinas/Áreas *</h3>
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
            <FormField control={form.control} name="customSubject" render={({ field }) => (
              <FormItem><FormLabel>Especifique a disciplina/área</FormLabel><FormControl><Input placeholder="Digite a disciplina ou área" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores (Opcional)</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Liste professores que podem ser contatos para estágio</p>
          <button
            type="button"
            onClick={() => setInstructors([...instructors, { name: '', subjects: [], customSubject: '', saved: false }])}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all"
          >
            + Adicionar Instrutor
          </button>

          {instructors.length > 0 && (
            <InstructorFields
              instructors={instructors}
              onRemove={(index) => setInstructors(instructors.filter((_, i) => i !== index))}
              onSave={(index) => {
                const updatedInstructors = [...instructors];
                updatedInstructors[index].saved = true;
                setInstructors(updatedInstructors);
              }}
              form={form}
              availableSubjects={availableSubjects}
            />
          )}
        </div>

        <button
          type="submit" 
          className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Cadastrando...</>) : ('Cadastrar Escola')}
        </button>
      </form>
    </Form>
  );
};
