import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const SubmissionHistory = () => {
  const { user } = useAuth();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["user-submissions", user?.email],
    queryFn: async () => {
      if (!user?.email) return { schools: [], instructors: [], students: [] };

      const [schools, instructors, students] = await Promise.all([
        supabase
          .from("pending_schools")
          .select("*")
          .eq("contributor_name", user.email)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("pending_instructors")
          .select("*")
          .eq("contributor_name", user.email)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("pending_former_students")
          .select("*")
          .eq("contributor_name", user.email)
          .order("submitted_at", { ascending: false }),
      ]);

      return {
        schools: schools.data || [],
        instructors: instructors.data || [],
        students: students.data || [],
      };
    },
    enabled: !!user?.email,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Minhas Contribuições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  const totalSubmissions =
    (submissions?.schools.length || 0) +
    (submissions?.instructors.length || 0) +
    (submissions?.students.length || 0);

  if (totalSubmissions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Minhas Contribuições
          </CardTitle>
          <CardDescription>
            Dados que você compartilhou com a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Você ainda não fez nenhuma contribuição
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Minhas Contribuições
        </CardTitle>
        <CardDescription>
          Total de {totalSubmissions} {totalSubmissions === 1 ? "contribuição" : "contribuições"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions?.schools && submissions.schools.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Escolas Cadastradas</h4>
            {submissions.schools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{school.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado {formatDistanceToNow(new Date(school.submitted_at), { locale: ptBR, addSuffix: true })}
                  </p>
                </div>
                {getStatusBadge(school.status || "pending")}
              </div>
            ))}
          </div>
        )}

        {submissions?.instructors && submissions.instructors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Professores Cadastrados</h4>
            {submissions.instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{instructor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {instructor.school_name} • {instructor.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviado {formatDistanceToNow(new Date(instructor.submitted_at), { locale: ptBR, addSuffix: true })}
                  </p>
                </div>
                {getStatusBadge(instructor.status || "pending")}
              </div>
            ))}
          </div>
        )}

        {submissions?.students && submissions.students.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Ex-Alunos Cadastrados</h4>
            {submissions.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student.university} - {student.course}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviado {formatDistanceToNow(new Date(student.submitted_at), { locale: ptBR, addSuffix: true })}
                  </p>
                </div>
                {getStatusBadge(student.status || "pending")}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
