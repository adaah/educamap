import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ContactRequestsPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["contact-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "denied" }) => {
      const { error } = await supabase
        .from("contact_requests")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contact-requests"] });
      toast.success(
        variables.status === "approved" 
          ? "Solicitação aprovada!" 
          : "Solicitação negada"
      );
    },
    onError: (error: any) => {
      toast.error("Erro ao processar solicitação: " + error.message);
    },
  });

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const respondedRequests = requests?.filter((r) => r.status !== "pending") || [];

  if (isLoading) {
    return <div className="text-center py-8">Carregando solicitações...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Acesso</CardTitle>
          <CardDescription>
            Nenhuma solicitação de acesso aos seus dados de contato
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Solicitações Pendentes ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Estas pessoas solicitaram acesso aos seus dados de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg space-y-3 bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{request.requester_name || "Usuário"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.requester_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solicitou há {formatDistanceToNow(new Date(request.created_at), { locale: ptBR, addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {request.entity_type === "former_student" ? "Ex-aluno" : "Professor"}
                  </Badge>
                </div>

                {request.message && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm italic">"{request.message}"</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      respondMutation.mutate({ id: request.id, status: "approved" })
                    }
                    disabled={respondMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      respondMutation.mutate({ id: request.id, status: "denied" })
                    }
                    disabled={respondMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Negar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {respondedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Solicitações</CardTitle>
            <CardDescription>
              Solicitações já respondidas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {respondedRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 border rounded-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{request.requester_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    {request.requester_email}
                  </p>
                </div>
                <Badge
                  variant={request.status === "approved" ? "default" : "secondary"}
                >
                  {request.status === "approved" ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Aprovado
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3 w-3" />
                      Negado
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
