import { redirect } from "next/navigation";
import { MultimediaForm } from "@/components/dashboard/multimedia/multimedia-form";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { getCurrentUser } from "@/lib/backend/auth";
import { canWriteMedia } from "@/lib/media-permissions";

export default async function CreateMultimediaPage() {
  // Sin permiso de carga no tiene sentido mostrar el formulario: el servidor rechazaría el archivo.
  if (!canWriteMedia(await getCurrentUser())) redirect("/dashboard/multimedia");

  return (
    <LayoutWrapper>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Suba una grabación de audio o una imagen y asóciela a una ocurrencia.
        </p>
        <MultimediaForm />
      </div>
    </LayoutWrapper>
  );
}
