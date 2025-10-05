import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[^a-zA-Z0-9]/, "A senha deve conter pelo menos um caractere especial");

const PasswordReset = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
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
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!newPassword.trim()) {
      toast.error("Por favor, insira uma nova senha");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Validate new password
    try {
      passwordSchema.parse(newPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      // Update password using the hook
      const { error } = await updatePassword(newPassword);

      if (error) {
        toast.error("Erro ao atualizar senha: " + error.message);
      } else {
        toast.success("Senha atualizada com sucesso!");
        setIsSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength(0);
        setPasswordErrors([]);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast.error("Erro inesperado ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return "Muito fraca";
    if (strength < 50) return "Fraca";
    if (strength < 75) return "Boa";
    return "Muito forte";
  };

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <div className="text-center">
              <h3 className="font-semibold">Senha atualizada com sucesso!</h3>
              <p className="text-sm text-green-600/80">
                Sua senha foi alterada com segurança.
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              Alterar senha novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Redefinir Senha
        </CardTitle>
        <CardDescription>
          Altere sua senha para manter sua conta segura. Use uma senha forte e única.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="Digite sua nova senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Força da senha:</span>
                  <span className={`font-medium ${
                    passwordStrength < 25 ? 'text-red-600' :
                    passwordStrength < 50 ? 'text-orange-600' :
                    passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                {passwordErrors.length > 0 && (
                  <div className="text-sm text-red-600">
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  As senhas não coincidem
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || passwordStrength < 75 || newPassword !== confirmPassword}
          >
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordReset;
