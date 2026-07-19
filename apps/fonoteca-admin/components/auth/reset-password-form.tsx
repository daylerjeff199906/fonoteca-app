"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";

export function ResetPasswordForm() {
  const params = useSearchParams(); const token = params.get("token") ?? ""; const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password") ?? ""); if (password !== form.get("confirmPassword")) return setMessage("Las contraseñas no coinciden."); setLoading(true); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const body = await response.json().catch(() => ({})); setMessage(response.ok ? "Contraseña actualizada. Ya puedes iniciar sesión." : body.message ?? "No se pudo actualizar la contraseña."); setLoading(false); }
  if (!token) return <p className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">El enlace de recuperación no es válido.</p>;
  return <form onSubmit={onSubmit} className="space-y-5"><p className="text-sm leading-6 text-slate-300">Usa una contraseña única de al menos 12 caracteres.</p><div className="space-y-2"><Label htmlFor="password" className="text-white">Nueva contraseña</Label><PasswordInput id="password" name="password" minLength={12} autoComplete="new-password" required className="h-11 rounded-full border-slate-600 bg-slate-800 text-white" /></div><div className="space-y-2"><Label htmlFor="confirmPassword" className="text-white">Confirmar contraseña</Label><PasswordInput id="confirmPassword" name="confirmPassword" minLength={12} autoComplete="new-password" required className="h-11 rounded-full border-slate-600 bg-slate-800 text-white" /></div>{message && <p className="rounded-md border border-lime-400/30 bg-lime-400/10 p-3 text-sm text-lime-100" role="status">{message}</p>}<Button className="h-11 w-full rounded-full bg-lime-400 font-semibold text-slate-950 hover:bg-lime-300" disabled={loading}>{loading ? "Actualizando..." : "Actualizar contraseña"}</Button><Link href="/login" className="block text-center text-sm text-lime-400 hover:text-lime-300">Ir a iniciar sesión</Link></form>;
}
