import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function CreateOccurrencePage() {
  return (
    <LayoutWrapper sectionTitle="Gestión de Ocurrencias">
      <OccurrenceForm redirectUrl="/dashboard/occurrences/[id]" />
    </LayoutWrapper>
  );
}
