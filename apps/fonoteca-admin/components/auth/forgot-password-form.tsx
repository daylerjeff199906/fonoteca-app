"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); const email = new FormData(event.currentTarget).get("email"); const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const body = await response.json().catch(() => ({})); setMessage(body.message ?? "No se pudo procesar la solicitud."); setLoading(false); }
  return <form onSubmit={onSubmit} className="space-y-5"><p className="text-sm leading-6 text-slate-300">Te enviaremos un enlace seguro para restablecer tu contraseña.</p><div className="space-y-2"><Label htmlFor="email" className="text-white">Correo electrónico</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><Input id="email" name="email" type="email" required autoComplete="email" className="h-11 rounded-full border-slate-600 bg-slate-800 pl-10 text-white" /></div></div>{message && <p className="rounded-md border border-lime-400/30 bg-lime-400/10 p-3 text-sm text-lime-100" role="status">{message}</p>}<Button className="h-11 w-full rounded-full bg-lime-400 font-semibold text-slate-950 hover:bg-lime-300" disabled={loading}>{loading ? "Enviando..." : "Enviar enlace"}</Button><Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="size-4"/>Volver a iniciar sesión</Link></form>;
}
