import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-950 p-6 text-white">
      <section className="max-w-md space-y-5 text-center">
        <Compass className="mx-auto size-12 text-lime-400" />
        <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">Error 404</p>
        <h1 className="text-3xl font-bold">Página no encontrada</h1>
        <p className="text-slate-300">
          La dirección que busca no existe o fue trasladada. Verifique el enlace o regrese al panel de Fonoteca.
        </p>
        <Button asChild className="rounded-full bg-lime-400 text-slate-950 hover:bg-lime-300">
          <Link href="/dashboard">Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
