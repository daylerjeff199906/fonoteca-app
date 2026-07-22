import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nueva contraseña" description="Elige una contraseña segura para proteger tu cuenta.">
      <Suspense fallback={<div className="p-4 text-center text-xs text-muted-foreground">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
