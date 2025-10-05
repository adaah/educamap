import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePendingSubmissions } from "@/hooks/usePendingSubmissions";
import { useSchools } from "@/hooks/useSchools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, Check, X, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminPanel = () => {
  const { user, isAdmin, loading, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    pendingSchools,
    pendingInstructors,
    pendingStudents,
    approveSchool,
    approveInstructor,
    approveStudent,
    rejectSubmission,
  } = usePendingSubmissions();

  const { data: schools = [] } = useSchools();

  const { data: contactLogs = [] } = useQuery({
    queryKey: ["contactLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_view_logs")
        .select("*")
        .order("viewed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

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

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pendentes
              <Badge variant="secondary" className="ml-2">
                {pendingSchools.length + pendingInstructors.length + pendingStudents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="existing">Dados Existentes</TabsTrigger>
            <TabsTrigger value="logs">
              Logs de Visualização
              <Badge variant="secondary" className="ml-2">
                {contactLogs.length}
              </Badge>
            </TabsTrigger>
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
                      <Button
                        size="sm"
                        onClick={() => approveSchool.mutate(school)}
                        disabled={approveSchool.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectSubmission.mutate({ table: "pending_schools", id: school.id })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rejeitar
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
                <CardTitle>Professores Pendentes ({pendingInstructors.length})</CardTitle>
                <CardDescription>Revisar e aprovar novos professores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingInstructors.map((instructor) => (
                  <div key={instructor.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">{instructor.name}</h3>
                    <p className="text-sm">Disciplina: {instructor.subject}</p>
                    {instructor.school_name && (
                      <p className="text-sm">Escola: {instructor.school_name}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => approveInstructor.mutate(instructor)}
                        disabled={approveInstructor.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectSubmission.mutate({ table: "pending_instructors", id: instructor.id })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rejeitar
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
                <CardTitle>Ex-Estagiários Pendentes ({pendingStudents.length})</CardTitle>
                <CardDescription>Revisar e aprovar ex-estagiários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm">Curso: {student.course}</p>
                    <p className="text-sm">Universidade: {student.university}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => approveStudent.mutate(student)}
                        disabled={approveStudent.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectSubmission.mutate({ table: "pending_former_students", id: student.id })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingStudents.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhum ex-estagiário pendente</p>
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

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Visualizações de Contatos</CardTitle>
                <CardDescription>
                  Registro de todos os usuários que visualizaram dados de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contactLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {log.viewer_email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              visualizou dados de contato de{" "}
                              <span className="font-medium">{log.viewed_entity_name}</span>
                              {" "}({log.viewed_entity_type === "former_student" ? "Ex-estagiário" : 
                                 log.viewed_entity_type === "instructor" ? "Professor" : "Escola"})
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {log.contact_fields_viewed.map((field: string) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(log.viewed_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {contactLogs.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma visualização registrada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
