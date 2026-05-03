import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Evento">
      <EventForm id={id} />
    </LayoutWrapper>
  );
}
