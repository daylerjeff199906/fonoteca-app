import { MultimediaForm } from "@/components/dashboard/multimedia/multimedia-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function EditMultimediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LayoutWrapper sectionTitle="Editar Multimedia">
      <MultimediaForm id={id} />
    </LayoutWrapper>
  );
}
