import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nueva contraseña" description="Elija una contraseña segura para proteger su cuenta.">
      <Suspense fallback={<div className="p-4 text-center text-xs text-muted-foreground">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
