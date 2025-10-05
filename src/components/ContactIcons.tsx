import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  Instagram, 
  Lock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface ContactData {
  email?: string | null;
  whatsapp?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
}

interface ContactIconsProps {
  contactData: ContactData;
  entityType: "former_student" | "instructor" | "school";
  entityId: string;
  entityName: string;
  ownerUserId?: string | null;
}

export const ContactIcons = ({
  contactData,
  entityType,
  entityId,
  entityName,
  ownerUserId
}: ContactIconsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [requestedContactType, setRequestedContactType] = useState<string>('');

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

  const handleContactClick = (contactType: string, contactValue: string) => {
    // LinkedIn sempre pode ser acessado
    if (contactType === 'linkedin') {
      window.open(contactValue, '_blank', 'noopener,noreferrer');
      return;
    }

    // Se não está logado, redireciona para login
    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    // Se tem acesso aprovado, abre o contato
    if (hasApprovedAccess) {
      if (contactType === 'email') {
        window.location.href = `mailto:${contactValue}`;
      } else if (contactType === 'whatsapp') {
        window.open(`https://wa.me/${contactValue.replace(/\D/g, "")}`, '_blank', 'noopener,noreferrer');
      } else if (contactType === 'instagram') {
        window.open(contactValue, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // Se não tem acesso, mostra aviso de permissão
    setRequestedContactType(contactType);
    setShowPermissionDialog(true);
  };

  const handleRequestPermission = async () => {
    if (!user) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    try {
      const { error } = await supabase.from("contact_requests").insert({
        requester_user_id: user.id,
        requester_email: user.email || "",
        requester_name: user.user_metadata?.full_name || "Usuário",
        owner_user_id: ownerUserId,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        message: `Solicitação de acesso ao ${requestedContactType} de ${entityName}`,
      });

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso!");
      setShowPermissionDialog(false);
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Você já enviou uma solicitação para este contato");
      } else {
        toast.error("Erro ao enviar solicitação: " + error.message);
      }
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <Phone className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      default: return null;
    }
  };

  const getContactLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'linkedin': return 'LinkedIn';
      case 'instagram': return 'Instagram';
      default: return '';
    }
  };

  const getContactValue = (type: string) => {
    switch (type) {
      case 'email': return contactData.email;
      case 'whatsapp': return contactData.whatsapp;
      case 'linkedin': return contactData.linkedin;
      case 'instagram': return contactData.instagram;
      default: return null;
    }
  };

  const hasAnyContact = contactData.email || contactData.whatsapp || contactData.linkedin || contactData.instagram;

  if (!hasAnyContact) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {Object.entries(contactData).map(([key, value]) => {
          if (!value) return null;
          
          const contactType = key;
          const contactValue = value;
          const isLinkedIn = contactType === 'linkedin';
          const hasAccess = isLinkedIn || hasApprovedAccess;
          
          return (
            <button
              key={contactType}
              onClick={() => handleContactClick(contactType, contactValue)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all
                ${hasAccess 
                  ? 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40' 
                  : 'border-muted-foreground/20 bg-muted/5 hover:bg-muted/10 hover:border-muted-foreground/40'
                }
                ${!isLinkedIn && !hasApprovedAccess ? 'cursor-pointer' : 'cursor-pointer'}
              `}
            >
              {getContactIcon(contactType)}
              <span className="text-sm font-medium">
                {getContactLabel(contactType)}
              </span>
              {!isLinkedIn && !hasApprovedAccess && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
              {hasApprovedAccess && !isLinkedIn && (
                <CheckCircle className="w-3 h-3 text-green-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dialog de permissão */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-lg">Acesso Restrito</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Para acessar o {getContactLabel(requestedContactType)} de <strong>{entityName}</strong>, 
                você precisa solicitar permissão. O proprietário dos dados será notificado e poderá 
                aprovar ou negar sua solicitação.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissionDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRequestPermission}
                  className="flex-1"
                >
                  Solicitar Acesso
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
