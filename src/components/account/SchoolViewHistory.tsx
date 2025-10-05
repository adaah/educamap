import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export const SchoolViewHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: viewHistory, isLoading } = useQuery({
    queryKey: ["school-views", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("school_views")
        .select(`
          id,
          viewed_at,
          school_id,
          schools (
            id,
            name,
            neighborhood,
            nature
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Histórico de Visualizações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (!viewHistory || viewHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Histórico de Visualizações
          </CardTitle>
          <CardDescription>
            Escolas que você já visitou aparecem aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma escola visualizada ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Histórico de Visualizações
        </CardTitle>
        <CardDescription>
          Últimas 10 escolas que você visitou
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {viewHistory.map((view) => {
          const school = view.schools as any;
          return (
            <div
              key={view.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{school?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {school?.neighborhood}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {school?.nature}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Visualizado {formatDistanceToNow(new Date(view.viewed_at), { locale: ptBR, addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/escola/${school?.id}`)}
              >
                Ver
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
