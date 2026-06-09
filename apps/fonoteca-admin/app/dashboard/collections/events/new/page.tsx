import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Milestone } from "lucide-react";

export default function NewCollectionEventPage() {
  return (
    <LayoutWrapper sectionTitle="Paso 1: Registrar Evento">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Monitoreo", href: "/dashboard/occurrences" },
            { label: "Registrar Colección", href: "/dashboard/collections/new" },
            { label: "Crear Evento", href: "/dashboard/collections/events/new", active: true },
          ]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario de Registro */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">
                Paso 1 de 3: Comencemos registrando el evento de muestreo. Al guardar, pasarás a la ventana para añadir las ocurrencias de este evento.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Datos del Evento de Muestreo
                </CardTitle>
                <CardDescription>
                  Completa la información general de la expedición o salida de campo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventForm redirectUrl="/dashboard/collections/events/[id]/occurrences" />
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Estado de los Pasos */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-3 border-b border-muted/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Milestone className="h-5 w-5 text-primary" />
                  Progreso del Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">Registrar Evento</p>
                      <p className="text-xs text-muted-foreground">Define el marco temporal, espacial y del equipo del muestreo.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Registrar Ocurrencias</p>
                      <p className="text-xs text-muted-foreground">Añade especímenes u observaciones avistados en el evento.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Añadir Multimedia</p>
                      <p className="text-xs text-muted-foreground">Adjunta archivos de audio, fotos o videos a cada ocurrencia.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
