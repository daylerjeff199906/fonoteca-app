import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { EcosystemForm } from "@/components/dashboard/geography/ecosystems/ecosystem-form";

export default async function EditEcosystemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Editar Ecosistema</h1>
          <p className="text-muted-foreground">Actualiza los detalles y factores diagnósticos del ecosistema.</p>
        </div>
        <EcosystemForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
