export const dynamic = "force-dynamic";

import { getOccurrence } from "@/actions/occurrences";
import { MultimediaSection } from "@/components/dashboard/occurrences/multimedia-section";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { buttonVariants } from "@/components/ui/button-variants";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function OccurrenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: occurrence, error } = await getOccurrence(id);

  if (error || !occurrence) {
    return (
      <LayoutWrapper sectionTitle="Detalle de Ocurrencia">
        <div className="p-4 text-red-500">Error: No se encontró la ocurrencia.</div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper sectionTitle={`Detalle: ${occurrence.occurrenceID}`}>
      <div className="flex items-center justify-between">
        <Link href="/dashboard/occurrences" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <Link href={`/dashboard/occurrences/${id}/edit`} className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
          <Edit className="h-4 w-4" /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border rounded-lg p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Datos Principales</h3>
          <p><span className="font-semibold text-muted-foreground mr-2">ID Ocurrencia:</span>{occurrence.occurrenceID}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Taxón:</span><span className="italic">{occurrence.taxon?.scientificName || "Desconocido"}</span></p>
          <p><span className="font-semibold text-muted-foreground mr-2">Ubicación:</span>{occurrence.location?.locality || "Desconocida"}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Fecha:</span>{occurrence.eventDate}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Hora:</span>{occurrence.eventTime || "-"}</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Información Adicional</h3>
          <p><span className="font-semibold text-muted-foreground mr-2">Registrado Por:</span>{occurrence.recordedBy}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Identificado Por:</span>{occurrence.identifiedBy || "-"}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Institución:</span>{occurrence.institutionCode}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Colección:</span>{occurrence.collectionCode}</p>
          <p><span className="font-semibold text-muted-foreground mr-2">Observaciones:</span>{occurrence.occurrenceRemarks || "-"}</p>
        </div>
      </div>

      <MultimediaSection occurrenceId={id} />
    </LayoutWrapper>
  );
}
