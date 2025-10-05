import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Mail, ArrowLeft, Bell, FileText, Eye, User as UserIcon } from "lucide-react";
import { ContactRequestsPanel } from "@/components/ContactRequestsPanel";
import { SchoolViewHistory } from "@/components/account/SchoolViewHistory";
import { SubmissionHistory } from "@/components/account/SubmissionHistory";
import { ProfileInfo } from "@/components/account/ProfileInfo";
import { useEffect } from "react";

const MyAccountPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-2xl font-poppins">
                    <Mail className="h-6 w-6 text-primary" />
                    Minha Conta
                  </CardTitle>
                  <CardDescription className="text-base">
                    {user.email}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Solicitações</span>
                <span className="sm:hidden">Avisos</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Histórico</span>
                <span className="sm:hidden">Visto</span>
              </TabsTrigger>
              <TabsTrigger value="contributions" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contribuições</span>
                <span className="sm:hidden">Envios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProfileInfo />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SchoolViewHistory />
                <SubmissionHistory />
              </div>
            </TabsContent>

            <TabsContent value="requests">
              <ContactRequestsPanel />
            </TabsContent>

            <TabsContent value="history">
              <SchoolViewHistory />
            </TabsContent>

            <TabsContent value="contributions">
              <SubmissionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
