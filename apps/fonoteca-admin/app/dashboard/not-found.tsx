import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <Compass className="size-12 text-primary" />
      <h2 className="text-2xl font-bold">Registro no encontrado</h2>
      <p className="text-sm text-muted-foreground">
        El registro solicitado no existe o ya no está disponible. Regrese al panel para continuar.
      </p>
      <Button asChild>
        <Link href="/dashboard">Volver al inicio</Link>
      </Button>
    </section>
  );
}
