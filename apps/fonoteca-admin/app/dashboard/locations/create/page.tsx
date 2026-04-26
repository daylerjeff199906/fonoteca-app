import { LocationForm } from "@/components/dashboard/locations/location-form";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function CreateLocationPage() {
  return (
    <LayoutWrapper sectionTitle="Gestión de Ubicaciones">
      <div className="flex flex-col gap-4">
        <Breadcrumbs 
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Ubicaciones", href: "/dashboard/locations" },
            { label: "Registrar Ubicación", href: "/dashboard/locations/create", active: true },
          ]} 
        />
        <LocationForm />
      </div>
    </LayoutWrapper>
  );
}
