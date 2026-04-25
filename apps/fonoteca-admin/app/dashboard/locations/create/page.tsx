import { LocationForm } from "@/components/dashboard/locations/location-form";
import { PageHeader } from "@/components/panel-admin/page-header";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default function CreateLocationPage() {
  return (
    <LayoutWrapper sectionTitle="Nueva Ubicación">
      <div className="w-full max-w-5xl mx-auto space-y-4 py-4 px-4">
        <PageHeader 
          title="Registrar Ubicación" 
          description="Revisa los campos para asegurar la precisión de la geografía." 
          backUrl="/dashboard/locations" 
        />
        <LocationForm />
      </div>
    </LayoutWrapper>
  );
}
