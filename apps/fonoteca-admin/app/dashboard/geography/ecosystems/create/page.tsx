import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { EcosystemForm } from "@/components/dashboard/geography/ecosystems/ecosystem-form";

export default function CreateEcosystemPage() {
  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Registrar Ecosistema</h1>
          <p className="text-muted-foreground">Catálogo detallado del ecosistema amazónico.</p>
        </div>
        <EcosystemForm />
      </div>
    </LayoutWrapper>
  );
}
