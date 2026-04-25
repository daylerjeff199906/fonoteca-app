import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Breadcrumbs } from "../../../../../components/panel-admin/breadcrumbs";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Evento">
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Eventos", href: "/dashboard/events" },
            { label: "Editar Evento", href: `/dashboard/events/${id}/edit`, active: true },
          ]}
        />
        <EventForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
