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
      <div className="w-full space-y-4 py-4 px-4">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Ubicaciones", href: "/dashboard/locations" },
            { label: "Registrar Ubicación", href: "/dashboard/locations/create", active: true },
          ]}
        />
        <LocationForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
