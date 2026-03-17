import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

const availableShifts = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const availablePeriods = ['Educação Infantil', 'Fundamental I', 'Fundamental II', 'Ensino Médio', 'EJA'];

export interface Instructor {
  name: string;
  subjects: string[];
  customSubject?: string;
  shifts?: string[];
  periods?: string[];
  saved?: boolean;
}

interface InstructorFieldsProps {
  instructors: Instructor[];
  onRemove: (index: number) => void;
  onSave?: (index: number) => void;
  form: UseFormReturn<any>;
  availableSubjects: string[];
}

export const InstructorFields = ({ 
  instructors, 
  onRemove,
  onSave,
  form,
  availableSubjects 
}: InstructorFieldsProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveInstructor = (index: number) => {
    const instructor = form.watch(`instructors.${index}`);
    
    if (!instructor?.name || !instructor?.subjects?.length) {
      return;
    }
    
    setEditingIndex(null);
    if (onSave) {
      onSave(index);
    }
  };

  return (
    <div className="space-y-6">
      {instructors.map((instructor, index) => {
        const isEditing = editingIndex === index || !instructor.saved;
        
        return (
        <div key={index} className="p-4 border-2 border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 relative">
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
              Instrutor {index + 1}
            </h4>
            {isEditing && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveInstructor(index)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`instructors.${index}.name`}
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
                      <FormLabel className="font-normal text-sm">Outros</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage />
            </div>

            {form.watch(`instructors.${index}.subjects`)?.includes('Outros') && (
              <FormField
                control={form.control}
                name={`instructors.${index}.customSubject`}
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
          </div>
        </div>
        );
      })}
    </div>
  );
};
