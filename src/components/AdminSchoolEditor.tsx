import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School } from '@/data/schools';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { X, Save, Edit2, Plus, Trash2, Loader2, MessageCircle, Users, GraduationCap } from "lucide-react";

interface AdminSchoolEditorProps {
  school: School;
  onClose: () => void;
}

export const AdminSchoolEditor = ({ school, onClose }: AdminSchoolEditorProps) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSubmitting] = useState(false);
  const [editedSchool, setEditedSchool] = useState<School>(school);
  const [editingInstructorId, setEditingInstructorId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const updateSchoolBasicInfo = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: editedSchool.name,
          full_address: editedSchool.fullAddress,
          neighborhood: editedSchool.neighborhood,
          nature: editedSchool.nature,
          email: editedSchool.email || null,
          phone: editedSchool.phone || null,
          website: editedSchool.website || null,
          additional_info: editedSchool.additionalInfo || null,
        })
        .eq('id', school.id);

      if (error) throw error;
      toast.success('Informações básicas atualizadas!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    if (!confirm('Tem certeza que deseja excluir este instrutor? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('instructors')
        .delete()
        .eq('id', instructorId);

      if (error) throw error;
      toast.success('Instrutor excluído!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao excluir instrutor: ' + error.message);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este estagiário? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('former_students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      toast.success('Estagiário excluído!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao excluir estagiário: ' + error.message);
    }
  };

  const handleUpdateInstructor = async (instructorId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('instructors')
        .update(updates)
        .eq('id', instructorId);

      if (error) throw error;
      toast.success('Instrutor atualizado!');
      setEditingInstructorId(null);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao atualizar instrutor: ' + error.message);
    }
  };

  const handleUpdateStudent = async (studentId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('former_students')
        .update(updates)
        .eq('id', studentId);

      if (error) throw error;
      toast.success('Estagiário atualizado!');
      setEditingStudentId(null);
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao atualizar estagiário: ' + error.message);
    }
  };

  const handleTogglePeriod = async (period: string) => {
    const newPeriods = editedSchool.periods.includes(period)
      ? editedSchool.periods.filter(p => p !== period)
      : [...editedSchool.periods, period];
    
    setEditedSchool({ ...editedSchool, periods: newPeriods });
    
    try {
      await supabase.from('school_periods').delete().eq('school_id', school.id);
      if (newPeriods.length > 0) {
        await supabase.from('school_periods').insert(
          newPeriods.map(p => ({ school_id: school.id, period: p }))
        );
      }
      toast.success('Períodos atualizados!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao atualizar períodos');
    }
  };

  const handleToggleShift = async (shift: string) => {
    const newShifts = editedSchool.shift.includes(shift)
      ? editedSchool.shift.filter(s => s !== shift)
      : [...editedSchool.shift, shift];
    
    setEditedSchool({ ...editedSchool, shift: newShifts });
    
    try {
      await supabase.from('school_shifts').delete().eq('school_id', school.id);
      if (newShifts.length > 0) {
        await supabase.from('school_shifts').insert(
          newShifts.map(s => ({ school_id: school.id, shift: s }))
        );
      }
      toast.success('Turnos atualizados!');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      queryClient.invalidateQueries({ queryKey: ['school', school.id] });
    } catch (error: any) {
      toast.error('Erro ao atualizar turnos');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com informações básicas da escola */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-primary">{editedSchool.name}</h2>
          <p className="text-sm text-muted-foreground">{editedSchool.fullAddress}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={editedSchool.nature === 'Pública' ? 'default' : 'secondary'}>
              {editedSchool.nature}
            </Badge>
            <Badge variant="outline">{editedSchool.neighborhood}</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="text-xs">Dados Básicos</TabsTrigger>
          <TabsTrigger value="instructors" className="text-xs">Instrutores</TabsTrigger>
          <TabsTrigger value="students" className="text-xs">Estagiários/Ex-Estagiários</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs">Contato</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Nome da Escola</Label>
                <Input 
                  value={editedSchool.name} 
                  onChange={(e) => setEditedSchool({...editedSchool, name: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Endereço Completo</Label>
                <Input 
                  value={editedSchool.fullAddress} 
                  onChange={(e) => setEditedSchool({...editedSchool, fullAddress: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Bairro</Label>
                  <Input 
                    value={editedSchool.neighborhood} 
                    onChange={(e) => setEditedSchool({...editedSchool, neighborhood: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Natureza</Label>
                  <Select 
                    value={editedSchool.nature} 
                    onValueChange={(value: any) => setEditedSchool({...editedSchool, nature: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pública">Pública</SelectItem>
                      <SelectItem value="Particular">Particular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Informações Adicionais</Label>
                <Textarea 
                  value={editedSchool.additionalInfo || ''} 
                  onChange={(e) => setEditedSchool({...editedSchool, additionalInfo: e.target.value})}
                  className="text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={updateSchoolBasicInfo} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Email</Label>
                <Input 
                  value={editedSchool.email || ''} 
                  onChange={(e) => setEditedSchool({...editedSchool, email: e.target.value})}
                  placeholder="Não informado"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Telefone</Label>
                <Input 
                  value={editedSchool.phone || ''} 
                  onChange={(e) => setEditedSchool({...editedSchool, phone: e.target.value})}
                  placeholder="Não informado"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Website</Label>
                <Input 
                  value={editedSchool.website || ''} 
                  onChange={(e) => setEditedSchool({...editedSchool, website: e.target.value})}
                  placeholder="Não informado"
                  className="text-sm"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={updateSchoolBasicInfo} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Instrutores ({school.instructors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {school.instructors.map((instructor) => (
                <div key={instructor.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{instructor.name}</h4>
                      <p className="text-sm text-muted-foreground">{instructor.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {instructor.additionalInfo && (
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-semibold text-primary mb-1">Relato:</p>
                      <p className="italic">"{instructor.additionalInfo}"</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {instructor.shifts?.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    {instructor.periods?.map(p => <Badge key={p} variant="outline" className="text-xs bg-primary/5">{p}</Badge>)}
                  </div>
                </div>
              ))}
              {school.instructors.length === 0 && (
                <p className="text-center py-8 text-muted-foreground italic">Nenhum instrutor cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Estagiários/Ex-Estagiários ({school.formerStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {school.formerStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">{student.course}</p>
                      <p className="text-sm text-muted-foreground">{student.university}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {student.additionalInfo && (
                    <div className="bg-muted/50 p-3 rounded text-sm">
                      <p className="font-semibold text-primary mb-1">Experiência:</p>
                      <p className="italic">"{student.additionalInfo}"</p>
                    </div>
                  )}
                </div>
              ))}
              {school.formerStudents.length === 0 && (
                <p className="text-center py-8 text-muted-foreground italic">Nenhum ex-aluno cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

