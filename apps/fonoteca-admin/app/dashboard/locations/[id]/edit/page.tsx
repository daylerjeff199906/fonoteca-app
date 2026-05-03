import { LocationForm } from "@/components/dashboard/locations/location-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import Breadcrumbs from "@/components/panel-admin/breadcrumbs";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Ubicación">
      <LocationForm id={id} />
    </LayoutWrapper>
  );
}
