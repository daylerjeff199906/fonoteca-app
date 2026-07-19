import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/backend/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthShell title="Iniciar sesión" description="Ingresa tu correo electrónico y contraseña para acceder a tu cuenta."><LoginForm /></AuthShell>;
}
