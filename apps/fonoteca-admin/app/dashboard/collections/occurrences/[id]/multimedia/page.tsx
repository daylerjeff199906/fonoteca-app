import { getOccurrence } from "@/actions/occurrences";
import { getMultimediaList } from "@/actions/multimedia";
import { MultimediaForm } from "@/components/dashboard/multimedia/multimedia-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Check, Play, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OccurrenceMultimediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch occurrence details and multimedia for this occurrence
  const [occRes, mediaRes] = await Promise.all([
    getOccurrence(id),
    getMultimediaList({ page: 1, limit: 100, occurrence_id: id })
  ]);

  const occurrence = occRes.data;
  const multimedia = mediaRes.data || [];

  if (!occurrence) {
    return <div className="p-8 text-center">Ocurrencia no encontrada.</div>;
  }

  const isFromEvent = !!occurrence.event_id;

  return (
    <LayoutWrapper sectionTitle={`Último Paso: Multimedia de Ocurrencia`}>
      <div className="space-y-6 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: "Monitoreo", href: "/dashboard/occurrences" },
            { label: "Registrar Colección", href: "/dashboard/collections/new" },
            ...(isFromEvent ? [{ label: "Ocurrencias", href: `/dashboard/collections/events/${occurrence.event_id}/occurrences` }] : []),
            { label: "Añadir Multimedia", href: `/dashboard/collections/occurrences/${id}/multimedia`, active: true },
          ]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario para añadir Multimedia */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">
                Paso Final: Registra todos los archivos multimedia (audios, imágenes, videos) asociados a la ocurrencia <strong>{occurrence.occurrenceID || "Sin ID"}</strong>. Al terminar de subir uno, aparecerá en la lista de la derecha. Puedes registrar tantos como necesites.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Nuevo Archivo Multimedia
                </CardTitle>
                <CardDescription>
                  Sube el archivo y completa sus metadatos (licencia, formato, autor).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultimediaForm 
                  defaultOccurrenceId={id} 
                  // Stay on the same page after creating, to allow adding more media.
                  redirectUrl={`/dashboard/collections/occurrences/${id}/multimedia`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Lista de Multimedia Actual */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader className="pb-3 border-b border-muted/10">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Archivos Registrados</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">{multimedia.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 max-h-[60vh] overflow-y-auto space-y-3">
                {multimedia.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Aún no hay archivos multimedia.
                  </div>
                ) : (
                  multimedia.map(media => (
                    <div key={media.id} className="p-3 rounded-lg border border-muted/20 bg-muted/5 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          {media.type === "Sound" ? <Play className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold truncate" title={media.originalFilename || "Archivo"}>{media.originalFilename || "Archivo sin nombre"}</p>
                          <p className="text-xs text-muted-foreground">
                            {media.format} • {media.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Botón de Finalización */}
                <div className="pt-4 mt-2 border-t border-muted/20">
                  <Button asChild className="w-full gap-2">
                    <Link href={isFromEvent ? `/dashboard/collections/events/${occurrence.event_id}/occurrences` : `/dashboard/occurrences`}>
                      <Check className="h-4 w-4" />
                      Terminar y volver
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
