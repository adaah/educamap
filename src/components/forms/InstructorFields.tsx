import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA', 'Técnico', 'Integrado Médio-Técnico', 'Outros'];

export interface Instructor {
  name: string;
  subjects: string[];
  customSubjects?: string[];
  customPeriods?: string[];
  shifts?: string[];
  periods?: string[];
  additionalInfo?: string;
  saved?: boolean;
  isNew?: boolean; // Indica se é um novo instrutor não listado
}

interface InstructorFieldsProps {
  instructors: Instructor[];
  onRemove: (index: number) => void;
  form: UseFormReturn<any>;
  availableSubjects: string[];
}

export const InstructorFields = ({ 
  instructors, 
  onRemove,
  form,
  availableSubjects 
}: InstructorFieldsProps) => {
  return (
    <div className="space-y-6">
      {instructors.map((instructor, index) => {
        return (
        <div key={index} className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5 relative">
          {instructors.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          )}

          <div className="flex items-center justify-between mb-4">
            <h4 className="font-poppins font-semibold text-base">
              {instructor.name || 'Instrutor'}
            </h4>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`instructors.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Instrutor *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome completo" 
                      {...field} 
                      disabled={!instructor.isNew} // Desabilitar se for instrutor existente
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-2 block">Disciplinas *</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSubjects.map((subject) => (
                  <FormField
                    key={subject}
                    control={form.control}
                    name={`instructors.${index}.subjects`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(subject)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), subject])
                                : field.onChange(
                                    field.value?.filter((value: string) => value !== subject)
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
                  name={`instructors.${index}.subjects`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes('Outros')}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), 'Outros'])
                              : field.onChange(
                                  field.value?.filter((value: string) => value !== 'Outros')
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        Outros
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage />
            </div>

            {form.watch(`instructors.${index}.subjects`)?.includes('Outros') && (
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium">Disciplinas Personalizadas</FormLabel>
                <FormField
                  control={form.control}
                  name={`instructors.${index}.customSubjects`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        {(field.value || []).map((customSubject, customIndex) => (
                          <div key={customIndex} className="flex gap-2">
                            <FormControl>
                              <Input
                                value={customSubject || ''}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  const newSubjects = [...currentValue];
                                  newSubjects[customIndex] = e.target.value;
                                  field.onChange(newSubjects);
                                }}
                                placeholder="Digite uma disciplina"
                              />
                            </FormControl>
                            {(field.value || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newSubjects = (field.value || []).filter((_, i) => i !== customIndex);
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
                  )}
                />
              </div>
            )}

            <div>
              <FormLabel className="mb-2 block">Turno(s) *</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {availableShifts.map((shift) => (
                  <FormField
                    key={shift}
                    control={form.control}
                    name={`instructors.${index}.shifts`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(shift)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), shift])
                                : field.onChange(
                                    field.value?.filter((value: string) => value !== shift)
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
            </div>

            <div>
              <FormLabel className="mb-2 block">Período(s) *</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {availablePeriods.map((period) => (
                  <FormField
                    key={period}
                    control={form.control}
                    name={`instructors.${index}.periods`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(period)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), period])
                                : field.onChange(
                                    field.value?.filter((value: string) => value !== period)
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-sm">{period}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {form.watch(`instructors.${index}.periods`)?.includes('Outros') && (
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium">Períodos Personalizados</FormLabel>
                <FormField
                  control={form.control}
                  name={`instructors.${index}.customPeriods`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        {(field.value || []).map((customPeriod, customIndex) => (
                          <div key={customIndex} className="flex gap-2">
                            <FormControl>
                              <Input
                                value={customPeriod || ''}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  const newPeriods = [...currentValue];
                                  newPeriods[customIndex] = e.target.value;
                                  field.onChange(newPeriods);
                                }}
                                placeholder="Digite um período personalizado"
                              />
                            </FormControl>
                            {(field.value || []).length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newPeriods = (field.value || []).filter((_, i) => i !== customIndex);
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
                  )}
                />
              </div>
            )}

            <div>
              <FormLabel className="mb-2 block">Informações Adicionais (Opcional)</FormLabel>
              <FormField
                control={form.control}
                name={`instructors.${index}.additionalInfo`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Comente sobre sua experiência com este instrutor..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};
