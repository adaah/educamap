import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

export interface Instructor {
  name: string;
  subjects: string[];
  customSubject?: string;
  email?: string;
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
}

interface InstructorFieldsProps {
  instructors: Instructor[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  form: UseFormReturn<any>;
  availableSubjects: string[];
}

export const InstructorFields = ({ 
  instructors, 
  onAdd, 
  onRemove, 
  form,
  availableSubjects 
}: InstructorFieldsProps) => {
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

      {instructors.map((instructor, index) => (
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

          <h4 className="font-poppins font-semibold text-base mb-4">
            Instrutor {index + 1}
          </h4>

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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`instructors.${index}.whatsapp`}
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

              <FormField
                control={form.control}
                name={`instructors.${index}.linkedin`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1 whitespace-nowrap">linkedin.com/in/</span>
                        <Input 
                          placeholder="seu-perfil" 
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove o prefixo se o usuário colar o link completo
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
                name={`instructors.${index}.instagram`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1 whitespace-nowrap">instagram.com/</span>
                        <Input 
                          placeholder="usuario" 
                          {...field}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Remove @ se o usuário digitar
                            value = value.replace(/^@/, '');
                            // Remove o prefixo se o usuário colar o link completo
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
        </div>
      ))}
    </div>
  );
};