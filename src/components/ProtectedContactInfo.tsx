import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Mail, Phone, Linkedin, Instagram } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
}

export const ProtectedContactInfo = ({
  entityType,
  entityId,
  entityName,
  contactData,
  contributorName,
}: ProtectedContactInfoProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasViewed, setHasViewed] = useState(false);

  const hasAnyContact = contactData.email || contactData.whatsapp || contactData.linkedin || contactData.instagram;

  useEffect(() => {
    // Log contact view when user is authenticated and contacts are available
    if (user && hasAnyContact && !hasViewed) {
      logContactView();
      setHasViewed(true);
    }
  }, [user, hasAnyContact]);

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
              Para visualizar informações de contato, você precisa fazer login ou criar uma conta.
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

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-lg">Informações de Contato</h3>
        <Lock className="h-4 w-4 text-green-600" />
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
        ℹ️ Sua visualização destes dados foi registrada para fins de auditoria
      </p>
    </Card>
  );
};
