import { LocationForm } from "@/components/dashboard/locations/location-form";
import { PageHeader } from "@/components/panel-admin/page-header";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Ubicación">
      <div className="w-full max-w-5xl mx-auto space-y-4 py-4 px-4">
        <PageHeader 
          title="Editar Ubicación" 
          description="Gestiona las coordenadas y metadatos geográficos." 
          backUrl="/dashboard/locations" 
        />
        <LocationForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
