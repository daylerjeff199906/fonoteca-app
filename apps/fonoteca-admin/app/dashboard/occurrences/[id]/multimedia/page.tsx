import { getOccurrence } from "@/actions/occurrences";
import { MultimediaSection } from "@/components/dashboard/occurrences/multimedia-section";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { FormFooter } from "@/components/panel-admin/form-footer";

export default async function OccurrenceMultimediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch occurrence details
  const { data: occurrence } = await getOccurrence(id);

  if (!occurrence) {
    return <div className="p-8 text-center">Ocurrencia no encontrada.</div>;
  }

  const isFromEvent = !!occurrence.event_id;

  return (
    <LayoutWrapper sectionTitle={`Último Paso: Multimedia de Ocurrencia`}>
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm font-medium text-primary">
              Paso Final: Registra los archivos multimedia (audios, imágenes, videos) asociados a la ocurrencia <strong>{occurrence.occurrenceID || "Sin ID"}</strong>.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
              <Link href={isFromEvent ? `/dashboard/collections/events/${occurrence.event_id}/occurrences` : `/dashboard/occurrences`}>
                <Check className="h-4 w-4 text-emerald-500" />
                Finalizar Registro
              </Link>
            </Button>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <MultimediaSection
              occurrenceId={id}
              location={occurrence.location?.locality || undefined}
            />
          </div>

          <FormFooter>
            <Button asChild variant="outline">
              <Link href={isFromEvent ? `/dashboard/collections/events/${occurrence.event_id}/occurrences` : `/dashboard/occurrences`}>
                Volver
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2 px-8">
              <Link href={isFromEvent ? `/dashboard/collections/events/${occurrence.event_id}/occurrences` : `/dashboard/occurrences`}>
                <Check className="h-5 w-5" />
                Terminar y Volver al Listado
              </Link>
            </Button>
          </FormFooter>
        </div>
      </div>
    </LayoutWrapper>
  );
}
