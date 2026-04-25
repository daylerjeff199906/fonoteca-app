import { MultimediaForm } from "@/components/dashboard/multimedia/multimedia-form";

export default async function EditMultimediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto space-y-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight">Editar Archivo Multimedia</h1>
      <p className="text-muted-foreground">Actualiza los metadatos de la grabación.</p>
      <MultimediaForm id={id} />
    </div>
  );
}
