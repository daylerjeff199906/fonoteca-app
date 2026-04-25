import { getEvent } from "@/actions/events";
import { getOccurrences } from "@/actions/occurrences";
import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowRight, FileAudio, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EventOccurrencesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch event details and occurrences for this event
  const [eventRes, occurrencesRes] = await Promise.all([
    getEvent(id),
    getOccurrences({ eventId: id, limit: 100 })
  ]);

  const event = eventRes.data;
  const occurrences = occurrencesRes.data || [];

  if (!event) {
    return <div className="p-8 text-center">Evento no encontrado.</div>;
  }

  return (
    <LayoutWrapper sectionTitle={`Paso 2: Ocurrencias del Evento ${event.eventID}`}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Monitoreo", href: "/dashboard/occurrences" },
            { label: "Registrar Colección", href: "/dashboard/collections/new" },
            { label: "Ocurrencias", href: `/dashboard/collections/events/${id}/occurrences`, active: true },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario para añadir Ocurrencia */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">
                Paso 2 de 3: Registra todas las ocurrencias asociadas a la expedición <strong>{event.eventID}</strong>. Al terminar de registrar una, aparecerá en la lista de la derecha.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Nueva Ocurrencia para este Evento
                </CardTitle>
                <CardDescription>
                  Llena los datos para añadir una nueva observación/espécimen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OccurrenceForm
                  defaultEventId={id}
                  redirectUrl={`/dashboard/collections/events/${id}/occurrences`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Lista de Ocurrencias Actuales */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-3 border-b border-muted/10">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Ocurrencias Registradas</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">{occurrences.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 max-h-[60vh] overflow-y-auto space-y-3">
                {occurrences.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Aún no hay ocurrencias.
                  </div>
                ) : (
                  occurrences.map(occ => (
                    <div key={occ.id} className="p-3 rounded-lg border border-muted/20 bg-muted/5 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold">{occ.occurrenceID || "Sin ID"}</p>
                          <p className="text-xs text-muted-foreground italic">
                            {occ.taxon?.scientificName || "Taxón no especificado"}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <Link href={`/dashboard/occurrences/${occ.id}/edit`} target="_blank">
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>

                      <Button asChild size="sm" variant="secondary" className="w-full h-8 text-xs gap-1.5 mt-2 bg-primary/10 hover:bg-primary/20 text-primary">
                        <Link href={`/dashboard/collections/occurrences/${occ.id}/multimedia`}>
                          <FileAudio className="h-3 w-3" />
                          <span>Paso 3: Añadir Multimedia</span>
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
