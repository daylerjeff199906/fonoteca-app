import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "../../../../components/panel-admin/breadcrumbs";

export default function NewEventPage() {
  return (
    <LayoutWrapper sectionTitle="Registrar Evento">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Eventos", href: "/dashboard/events" },
            { label: "Nuevo Evento", href: "/dashboard/events/new", active: true },
          ]}
        />
        <EventForm />
      </div>
    </LayoutWrapper>
  );
}
