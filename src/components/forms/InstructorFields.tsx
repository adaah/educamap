import { X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';

export interface Instructor {
  name: string;
  subjects: string[];
  customSubject?: string;
  email?: string;
  linkedin?: string;
  saved?: boolean;
}

interface InstructorFieldsProps {
  instructors: Instructor[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave?: (index: number) => void;
  form: UseFormReturn<any>;
  availableSubjects: string[];
}

export const InstructorFields = ({ 
  instructors, 
  onAdd, 
  onRemove,
  onSave,
  form,
  availableSubjects 
}: InstructorFieldsProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveInstructor = (index: number) => {
    const instructor = form.watch(`instructors.${index}`);
    
    // Validar se tem nome e pelo menos uma disciplina
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-poppins font-semibold text-base sm:text-lg">Professores Instrutores</h3>
        <button
          type="button"
          onClick={onAdd}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:shadow-lg transition-all"
        >
          + Adicionar Instrutor
        </button>
      </div>

      {instructors.map((instructor, index) => {
        const isSaved = instructor.saved || editingIndex !== index;
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`instructors.${index}.email`}
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
                name={`instructors.${index}.linkedin`}
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
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Pelo menos um dos campos (Email ou LinkedIn) é recomendado para contato.
            </p>
          </div>
        </div>
        );
      })}
    </div>
  );
};