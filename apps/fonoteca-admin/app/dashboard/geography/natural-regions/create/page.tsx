import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { NaturalRegionForm } from "@/components/dashboard/geography/natural-regions/natural-region-form";

export default function CreateNaturalRegionPage() {
  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Registrar Región Natural</h1>
          <p className="text-muted-foreground">Define una nueva región o ecosistema macro.</p>
        </div>
        <NaturalRegionForm />
      </div>
    </LayoutWrapper>
  );
}
