import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePendingSubmissions } from "@/hooks/usePendingSubmissions";
import { useSchools } from "@/hooks/useSchools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Check, X, Trash2 } from "lucide-react";
import { AdminNotifications } from "@/components/AdminNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AdminPanel = () => {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const {
    pendingSchools,
    pendingSchoolUpdates,
    pendingInstructors,
    pendingStudents,
    approveSchool,
    approveSchoolUpdate,
    approveInstructor,
    approveStudent,
    rejectSubmission,
  } = usePendingSubmissions();

  const { data: schools = [] } = useSchools();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin-acesso");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const deleteSchool = useMutation({
    mutationFn: async (schoolId: string) => {
      const { error } = await supabase.from("schools").delete().eq("id", schoolId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Escola excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir escola: " + error.message);
    },
  });

  const deleteInstructor = useMutation({
    mutationFn: async (instructorId: string) => {
      const { error } = await supabase.from("instructors").delete().eq("id", instructorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Professor excluído com sucesso!");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Bem-vindo, {user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <AdminNotifications />

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes
              <Badge variant="secondary" className="ml-2">
                {pendingSchools.length + pendingInstructors.length + pendingStudents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="existing">Dados Existentes</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escolas Pendentes ({pendingSchools.length})</CardTitle>
                <CardDescription>Revisar e aprovar novas escolas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingSchools.map((school) => (
                  <div key={school.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">{school.name}</h3>
                    <p className="text-sm text-muted-foreground">{school.full_address}</p>
                    <p className="text-sm">Bairro: {school.neighborhood}</p>
                    <p className="text-sm">Natureza: {school.nature}</p>
                    {school.contributor_name && (
                      <p className="text-sm">Contribuidor: {school.contributor_name}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => approveSchool.mutate(school)} disabled={approveSchool.isPending}>
                        <Check className="mr-2 h-4 w-4" />Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectSubmission.mutate({ table: "pending_schools", id: school.id })}>
                        <X className="mr-2 h-4 w-4" />Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingSchools.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhuma escola pendente</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atualizações Institucionais ({pendingSchoolUpdates.length})</CardTitle>
                <CardDescription>Revisar atualizações enviadas para escolas existentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingSchoolUpdates.map((update) => (
                  <div key={update.id} className="border rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Escola ID: {update.school_id}</p>
                    {update.contributor_name && (
                      <p className="text-sm">Contribuidor: {update.contributor_name}{update.contributor_position ? ` - ${update.contributor_position}` : ""}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {update.email && <p>Email: {update.email}</p>}
                      {update.phone && <p>Telefone: {update.phone}</p>}
                      {update.website && <p>Website: {update.website}</p>}
                    </div>
                    {update.additional_info && (
                      <p className="text-sm">Info adicional: {update.additional_info}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => approveSchoolUpdate.mutate(update)} disabled={approveSchoolUpdate.isPending}>
                        <Check className="mr-2 h-4 w-4" />Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectSubmission.mutate({ table: "pending_school_updates", id: update.id })}
                      >
                        <X className="mr-2 h-4 w-4" />Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingSchoolUpdates.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhuma atualização pendente</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professores Pendentes ({pendingInstructors.length})</CardTitle>
                <CardDescription>Revisar e aprovar novos professores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingInstructors.map((instructor) => (
                  <div key={instructor.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm">Disciplina: {instructor.subject}</p>
                    {instructor.school_name && <p className="text-sm">Escola: {instructor.school_name}</p>}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => approveInstructor.mutate(instructor)} disabled={approveInstructor.isPending}>
                        <Check className="mr-2 h-4 w-4" />Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectSubmission.mutate({ table: "pending_instructors", id: instructor.id })}>
                        <X className="mr-2 h-4 w-4" />Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingInstructors.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhum professor pendente</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estagiários Pendentes ({pendingStudents.length})</CardTitle>
                <CardDescription>Revisar e aprovar estagiários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm">Curso: {student.course}</p>
                    <p className="text-sm">Universidade: {student.university}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => approveStudent.mutate(student)} disabled={approveStudent.isPending}>
                        <Check className="mr-2 h-4 w-4" />Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectSubmission.mutate({ table: "pending_former_students", id: student.id })}>
                        <X className="mr-2 h-4 w-4" />Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingStudents.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhum estagiário pendente</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="existing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escolas Cadastradas ({schools.length})</CardTitle>
                <CardDescription>Gerenciar escolas existentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {schools.map((school) => (
                  <div key={school.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{school.name}</h3>
                        <p className="text-sm text-muted-foreground">{school.fullAddress}</p>
                        <p className="text-sm">Professores: {school.instructors?.length || 0}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir ${school.name}?`)) {
                            deleteSchool.mutate(school.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
