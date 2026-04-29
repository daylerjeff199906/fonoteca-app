import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { InstitutionForm } from "@/components/dashboard/geography/institutions/institution-form";

export default async function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Institución">
      <div className="w-full">
        <InstitutionForm id={id} />
      </div>
    </LayoutWrapper>
  );
}
