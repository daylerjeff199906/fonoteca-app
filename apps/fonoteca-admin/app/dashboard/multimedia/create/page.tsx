import { MultimediaForm } from "@/components/dashboard/multimedia/multimedia-form";

export default function CreateMultimediaPage() {
  return (
    <div className="container mx-auto space-y-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight">Subir Archivo Multimedia</h1>
      <p className="text-muted-foreground">Registra grabaciones de audio o videos asociados a una ocurrencia.</p>
      <MultimediaForm />
    </div>
  );
}
