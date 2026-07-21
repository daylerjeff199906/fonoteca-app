"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { showToast } from "@/lib/toast";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), remember }) });
    const body = await response.json().catch(() => ({})); setLoading(false);
    if (!response.ok) return setError(body.message ?? "No se pudo iniciar sesión.");
    showToast.success("Inicio de sesión exitoso", "Has accedido correctamente a tu cuenta.");
    router.replace("/dashboard"); router.refresh();
  }

  return <form onSubmit={onSubmit} className="space-y-5" noValidate>
    <div className="space-y-2"><Label htmlFor="email" className="text-white">Correo electrónico</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input id="email" name="email" type="email" autoComplete="email" required placeholder="nombre@iiap.gob.pe" className="h-11 rounded-full border-slate-600 bg-slate-800 pl-10 text-white placeholder:text-slate-500" /></div></div>
    <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-white">Contraseña</Label><Link href="/forgot-password" className="text-sm font-medium text-lime-400 hover:text-lime-300">¿Olvidaste tu contraseña?</Link></div><PasswordInput id="password" name="password" autoComplete="current-password" required className="h-11 rounded-full border-slate-600 bg-slate-800 pr-11 text-white" /></div>
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-100"><Checkbox checked={remember} onCheckedChange={setRemember} className="rounded-full border-lime-400 data-[state=checked]:bg-lime-400 data-[state=checked]:text-slate-950" />Recordarme</label>
    {error && <p className="rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200" role="alert">{error}</p>}
    <Button className="h-11 w-full rounded-full bg-lime-400 font-semibold text-slate-950 hover:bg-lime-300" type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</Button>
  </form>;
}
