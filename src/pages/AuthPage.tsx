import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserPlus, LogIn, ArrowLeft, Check, X, ShieldCheck, KeyRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial");

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Check password strength
  useEffect(() => {
    const errors: string[] = [];
    let strength = 0;

    if (password.length >= 8) strength += 25;
    else errors.push("Mínimo 8 caracteres");

    if (/[a-z]/.test(password)) strength += 25;
    else errors.push("Uma letra minúscula");

    if (/[A-Z]/.test(password)) strength += 25;
    else errors.push("Uma letra maiúscula");

    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    else errors.push("Um caractere especial");

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!fullName.trim()) {
      toast.error("Por favor, preencha seu nome completo");
      return;
    }

    // Validate password
    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    const { error } = await signUp(email, password, {
      full_name: fullName,
      occupation: occupation || null,
      institution: institution || null,
    });

    if (error) {
      toast.error("Erro ao criar conta: " + error.message);
    } else {
      toast.success("Conta criada com sucesso! Você já pode fazer login.");
      setEmail("");
      setPassword("");
      setFullName("");
      setOccupation("");
      setInstitution("");
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
    } else {
      toast.success("Login realizado com sucesso!");
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error("Por favor, insira seu email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error("Erro ao enviar email de recuperação: " + error.message);
    } else {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setShowForgotPassword(false);
      setResetEmail("");
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 pb-20 md:pb-8">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card className="shadow-2xl border-2">
            <CardHeader className="text-center space-y-2 pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-2">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-poppins font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bem-vindo
              </CardTitle>
              <CardDescription className="text-base">
                Acesse ou crie sua conta para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {showForgotPassword ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-primary" />
                    <h3 className="font-poppins font-semibold text-lg">Recuperar Senha</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Insira seu email e enviaremos um link para você redefinir sua senha.
                  </p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                        disabled={loading}
                      >
                        {loading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="font-montserrat">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="font-montserrat">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastro
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      <Button 
                        type="button"
                        variant="link"
                        onClick={() => setShowForgotPassword(true)}
                        className="px-0 text-sm h-auto"
                      >
                        Esqueceu sua senha?
                      </Button>
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-montserrat font-semibold text-base" 
                        disabled={loading}
                      >
                        {loading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Nome Completo *</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email *</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-occupation">Ocupação</Label>
                        <Input
                          id="signup-occupation"
                          type="text"
                          placeholder="Ex: Estudante, Professor, Coordenador"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-institution">Instituição de Ensino</Label>
                        <Input
                          id="signup-institution"
                          type="text"
                          placeholder="Ex: UFBA, UNEB"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Senha *</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Senha forte"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11"
                        />

                        {password && (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Força da senha:</span>
                              <span className={`font-semibold ${
                                passwordStrength === 100 ? "text-green-600" :
                                passwordStrength >= 50 ? "text-yellow-600" :
                                "text-red-600"
                              }`}>
                                {passwordStrength === 100 ? "Forte" :
                                 passwordStrength >= 50 ? "Média" :
                                 "Fraca"}
                              </span>
                            </div>
                            <Progress value={passwordStrength} className="h-2" />

                            <div className="space-y-1 mt-3">
                              {passwordErrors.length > 0 ? (
                                passwordErrors.map((error, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-red-600">
                                    <X className="w-3 h-3" />
                                    <span>{error}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                  <Check className="w-3 h-3" />
                                  <span>Senha forte!</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-montserrat font-semibold text-base" 
                        disabled={loading || passwordStrength < 100}
                      >
                        {loading ? "Criando conta..." : "Criar Conta"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground bg-card/50 backdrop-blur-sm p-3 rounded-lg border">
            🔒 Seus dados são protegidos e utilizados apenas para controle de acesso
          </p>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </>
  );
};

export default AuthPage;
