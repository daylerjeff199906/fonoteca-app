import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return <AuthShell title="Recuperar contraseña" description="No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta."><ForgotPasswordForm /></AuthShell>;
}
