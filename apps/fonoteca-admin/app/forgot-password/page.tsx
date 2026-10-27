import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <AuthShell title="Recuperar contraseña" description="Le ayudaremos a recuperar el acceso a su cuenta."><ForgotPasswordForm /></AuthShell>;
}
