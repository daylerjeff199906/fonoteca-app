import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function CreateOccurrencePage() {
  return (
    <LayoutWrapper sectionTitle="Gestión de Ocurrencias">
      <div className="flex flex-col gap-4">
        <Breadcrumbs 
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Ocurrencias", href: "/dashboard/occurrences" },
            { label: "Nueva Ocurrencia", href: "/dashboard/occurrences/create", active: true },
          ]} 
        />
        <OccurrenceForm />
      </div>
    </LayoutWrapper>
  );
}
