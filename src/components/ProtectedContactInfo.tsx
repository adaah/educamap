import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Mail, Phone, Linkedin, Instagram, Send, Check, X, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ContactData {
  email?: string | null;
  whatsapp?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
}

interface ProtectedContactInfoProps {
  entityType: "former_student" | "instructor" | "school";
  entityId: string;
  entityName: string;
  contactData: ContactData;
  contributorName?: string | null;
  ownerUserId?: string | null;
}

export const ProtectedContactInfo = ({
  entityType,
  entityId,
  entityName,
  contactData,
  contributorName,
  ownerUserId,
}: ProtectedContactInfoProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requesterName, setRequesterName] = useState("");

  const hasAnyContact = contactData.email || contactData.whatsapp || contactData.linkedin || contactData.instagram;

  // Check if user already has an approved request or is the owner
  const { data: existingRequest } = useQuery({
    queryKey: ["contact-request", entityId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("contact_requests")
        .select("*")
        .eq("entity_id", entityId)
        .eq("requester_user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isOwner = user && ownerUserId && user.id === ownerUserId;
  const hasApprovedAccess = existingRequest?.status === "approved" || isOwner;

  const handleRequestAccess = async () => {
    if (!user || !requesterName.trim()) {
      toast.error("Por favor, preencha seu nome");
      return;
    }

    try {
      const { error } = await supabase.from("contact_requests").insert({
        requester_user_id: user.id,
        requester_email: user.email || "",
        requester_name: requesterName,
        owner_user_id: ownerUserId,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        message: requestMessage || null,
      });

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso!");
      setShowRequestForm(false);
      setRequestMessage("");
      setRequesterName("");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Você já enviou uma solicitação para este contato");
      } else {
        toast.error("Erro ao enviar solicitação: " + error.message);
      }
    }
  };

  const logContactView = async () => {
    if (!user) return;

    const fieldsViewed: string[] = [];
    if (contactData.email) fieldsViewed.push("email");
    if (contactData.whatsapp) fieldsViewed.push("whatsapp");
    if (contactData.linkedin) fieldsViewed.push("linkedin");
    if (contactData.instagram) fieldsViewed.push("instagram");

    try {
      await supabase.from("contact_view_logs").insert({
        viewer_user_id: user.id,
        viewer_email: user.email || "unknown",
        viewed_entity_type: entityType,
        viewed_entity_id: entityId,
        viewed_entity_name: entityName,
        contact_fields_viewed: fieldsViewed,
      });
    } catch (error) {
      console.error("Error logging contact view:", error);
    }
  };

  useEffect(() => {
    if (hasApprovedAccess && hasAnyContact) {
      logContactView();
    }
  }, [hasApprovedAccess, hasAnyContact]);

  if (!hasAnyContact) {
    return null;
  }

  if (!user) {
    return (
      <Card className="p-6 bg-muted/50 border-2 border-dashed">
        <div className="flex flex-col items-center text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg mb-2">Dados de Contato Protegidos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para solicitar acesso às informações de contato, você precisa fazer login ou criar uma conta.
            </p>
          </div>
          <Button
            onClick={() => navigate("/auth", { state: { from: location.pathname } })}
            className="w-full sm:w-auto"
          >
            Fazer Login / Criar Conta
          </Button>
        </div>
      </Card>
    );
  }

  // User is logged in but doesn't have access yet
  if (!hasApprovedAccess) {
    const requestStatus = existingRequest?.status;

    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Informações de Contato Protegidas</h3>
        </div>

        {requestStatus === "pending" && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Sua solicitação está pendente. Aguarde a aprovação do proprietário dos dados.
            </p>
          </div>
        )}

        {requestStatus === "denied" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
            <X className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Sua solicitação foi negada.
            </p>
          </div>
        )}

        {(!requestStatus || requestStatus === "denied") && !showRequestForm && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para visualizar os dados de contato de <strong>{entityName}</strong>, você precisa solicitar acesso.
            </p>
            <Button onClick={() => setShowRequestForm(true)} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Solicitar Acesso
            </Button>
          </div>
        )}

        {showRequestForm && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Seu Nome</label>
              <Input
                placeholder="Como você gostaria de ser identificado"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem (opcional)</label>
              <Textarea
                placeholder="Explique por que você gostaria de acessar essas informações..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRequestAccess} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Enviar Solicitação
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestForm(false);
                  setRequestMessage("");
                  setRequesterName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // User has approved access - show contact info
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Check className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-lg">Informações de Contato</h3>
      </div>

      {contributorName && (
        <p className="text-sm text-muted-foreground mb-4">
          Dados compartilhados por: {contributorName}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contactData.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${contactData.email}`}
              className="text-sm hover:underline"
            >
              {contactData.email}
            </a>
          </div>
        )}

        {contactData.whatsapp && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`https://wa.me/${contactData.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              {contactData.whatsapp}
            </a>
          </div>
        )}

        {contactData.linkedin && (
          <div className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-muted-foreground" />
            <a
              href={contactData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              LinkedIn
            </a>
          </div>
        )}

        {contactData.instagram && (
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-muted-foreground" />
            <a
              href={contactData.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              Instagram
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        ℹ️ Acesso autorizado • Sua visualização foi registrada
      </p>
    </Card>
  );
};
