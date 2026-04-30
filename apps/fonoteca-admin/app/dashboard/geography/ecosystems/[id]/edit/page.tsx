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
      <EcosystemForm id={id} />
    </LayoutWrapper>
  );
}
