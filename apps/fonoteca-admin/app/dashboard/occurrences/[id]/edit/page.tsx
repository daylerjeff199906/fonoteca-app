import { PageHeader } from "@/components/panel-admin/page-header";
import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { MultimediaSection } from "@/components/dashboard/occurrences/multimedia-section";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function EditOccurrencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Ocurrencia">
      <div className="w-full max-w-5xl mx-auto space-y-4 py-4 px-4">
        <PageHeader 
          title="Editar Ocurrencia" 
          description="Sube archivos y gestiona metadatos del registro." 
          backUrl="/dashboard/occurrences" 
        />
        <OccurrenceForm id={id} />
        <MultimediaSection occurrenceId={id} />
      </div>
    </LayoutWrapper>
  );
}
