import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";

export default function NewCollectionEventPage() {
  return (
    <LayoutWrapper sectionTitle="Paso 1: Crear Evento">
      <div className="space-y-6 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Monitoreo", href: "/dashboard/occurrences" },
            { label: "Registrar Colección", href: "/dashboard/collections/new" },
            { label: "Crear Evento", href: "/dashboard/collections/events/new", active: true },
          ]}
        />
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-primary">
            Paso 1 de 3: Comencemos registrando el evento de muestreo. Al guardar, pasarás a la ventana para añadir las ocurrencias de este evento.
          </p>
        </div>

        <EventForm redirectUrl="/dashboard/collections/events/[id]/occurrences" />
      </div>
    </LayoutWrapper>
  );
}
