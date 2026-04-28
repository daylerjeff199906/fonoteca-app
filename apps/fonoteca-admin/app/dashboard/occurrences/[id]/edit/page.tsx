import { OccurrenceForm } from "@/components/dashboard/occurrences/occurrence-form";
import { MultimediaSection } from "@/components/dashboard/occurrences/multimedia-section";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import Breadcrumbs from "@/components/panel-admin/breadcrumbs";

export default async function EditOccurrencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Ocurrencia">
      <div className="w-full space-y-4 py-4 px-4">
        <OccurrenceForm id={id} />
        <MultimediaSection occurrenceId={id} />
      </div>
    </LayoutWrapper>
  );
}
