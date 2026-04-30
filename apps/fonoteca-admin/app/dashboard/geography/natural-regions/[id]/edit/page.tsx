import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { NaturalRegionForm } from "@/components/dashboard/geography/natural-regions/natural-region-form";

export default async function EditNaturalRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Editar Región Natural</h1>
          <p className="text-muted-foreground">Actualiza los detalles de la región natural.</p>
        </div>
        <NaturalRegionForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
