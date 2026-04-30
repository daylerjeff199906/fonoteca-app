import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { InstitutionForm } from "@/components/dashboard/geography/institutions/institution-form";

export default function CreateInstitutionPage() {
  return (
    <LayoutWrapper sectionTitle="Registrar Institución">
      <div className="w-full">
        <InstitutionForm />
      </div>
    </LayoutWrapper>
  );
}
