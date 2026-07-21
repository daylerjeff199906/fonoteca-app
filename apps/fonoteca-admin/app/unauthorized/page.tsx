import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return <main className="grid min-h-svh place-items-center bg-slate-950 p-6 text-white"><section className="max-w-md space-y-5 text-center"><ShieldAlert className="mx-auto size-12 text-lime-400"/><h1 className="text-3xl font-bold">Acceso no autorizado</h1><p className="text-slate-300">Tu cuenta no tiene un rol administrador para acceder al panel de Fonoteca.</p><Button asChild className="rounded-full bg-lime-400 text-slate-950 hover:bg-lime-300"><Link href="/login">Volver a iniciar sesión</Link></Button></section></main>;
}
