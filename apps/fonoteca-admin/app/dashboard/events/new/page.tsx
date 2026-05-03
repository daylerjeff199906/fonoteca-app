import { EventForm } from "@/components/dashboard/events/event-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function NewEventPage() {
  return (
    <LayoutWrapper sectionTitle="Registrar Evento">
      <EventForm />
    </LayoutWrapper>
  );
}
