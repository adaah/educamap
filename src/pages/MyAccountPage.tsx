import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Mail, ArrowLeft, Bell, FileText, Eye, User as UserIcon, Trash2 } from "lucide-react";
import { ContactRequestsPanel } from "@/components/ContactRequestsPanel";
import { SchoolViewHistory } from "@/components/account/SchoolViewHistory";
import { SubmissionHistory } from "@/components/account/SubmissionHistory";
import { ProfileInfo } from "@/components/account/ProfileInfo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyAccountPage = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Chamar edge function para deletar a conta
      const { error } = await supabase.functions.invoke('delete-user-account');
      
      if (error) throw error;
      
      toast.success("Conta deletada com sucesso");
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Erro ao deletar conta:", error);
      toast.error("Erro ao deletar conta: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
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

            {/* Danger Zone - Delete Account */}
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis relacionadas à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Apagar Minha Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>Esta ação não pode ser desfeita. Isso irá permanentemente:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Deletar sua conta</li>
                          <li>Remover todos os seus dados pessoais</li>
                          <li>Deletar seu histórico de visualizações</li>
                          <li>Remover suas contribuições pendentes</li>
                        </ul>
                        <p className="font-semibold text-destructive mt-4">
                          Esta ação é irreversível!
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deletando..." : "Sim, apagar minha conta"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </>
  );
};

export default MyAccountPage;
