import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import Link from "next/link";
import { ArrowRight, CalendarPlus, FileAudio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCollectionPage() {
  return (
    <LayoutWrapper sectionTitle="Registrar Colección">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Monitoreo", href: "/dashboard/occurrences" },
            { label: "Registrar Colección", href: "/dashboard/collections/new", active: true },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Opción 1: A través de Eventos */}
          <Link href="/dashboard/collections/events/new" className="group">
            <Card className="h-full border border-muted/20 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <CalendarPlus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Comencemos: Añade Colecciones al Evento</CardTitle>
                <CardDescription className="text-xs mt-2">
                  Flujo completo. Primero registra un Evento de Muestreo (Expedición), luego añade múltiples Ocurrencias a ese evento, y finalmente adjunta contenido Multimedia a cada ocurrencia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary mt-4">
                  <span>Iniciar flujo guiado</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Opción 2: Solo Ocurrencias */}
          <Link href="/dashboard/collections/occurrences/new" className="group">
            <Card className="h-full border border-muted/20 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FileAudio className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Comencemos: Añade Multimedia a la Ocurrencia</CardTitle>
                <CardDescription className="text-xs mt-2">
                  Flujo directo. Si no necesitas agrupar las ocurrencias bajo un evento específico, registra directamente la Ocurrencia y adjunta su contenido Multimedia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary mt-4">
                  <span>Iniciar flujo directo</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </LayoutWrapper>
  );
}
