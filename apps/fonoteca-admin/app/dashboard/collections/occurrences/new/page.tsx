import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";

export default function NewCollectionOccurrencePage() {
  return (
    <LayoutWrapper sectionTitle="Paso 1: Crear Ocurrencia">
      <div className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-primary">
            Paso 1 de 2: Registra los detalles de la ocurrencia. Al guardar, pasarás automáticamente a la sección para añadirle archivos multimedia.
          </p>
        </div>

        <OccurrenceForm redirectUrl="/dashboard/occurrences/[id]/multimedia" />
      </div>
    </LayoutWrapper>
  );
}
