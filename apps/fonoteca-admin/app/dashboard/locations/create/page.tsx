import { LocationForm } from "@/components/dashboard/locations/location-form";
import { Breadcrumbs } from "@/components/panel-admin/breadcrumbs";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function CreateLocationPage() {
  return (
    <LayoutWrapper sectionTitle="Gestión de Ubicaciones">
      <LocationForm />
    </LayoutWrapper>
  );
}
