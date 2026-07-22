import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCrudItem } from "@/lib/backend/crud";
import { 
  FileAudio, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Lock,
  Music
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

const getR2Key = (url: string) => {
  if (url.startsWith(R2_PUBLIC_URL)) {
    return url.replace(`${R2_PUBLIC_URL}/`, "");
  }
  const parts = url.split('.r2.dev/');
  if (parts.length > 1) return parts[1];
  return url;
};

const getDownloadUrl = async (url: string) => {
  const key = getR2Key(url);
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"`,
    });
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("Error signing download url:", err);
    return url;
  }
};

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let request: any = null;
  try {
    request = await getCrudItem<any>("audio-requests", id);
  } catch {
    return <ErrorState title="Enlace no válido" description="No se ha encontrado ninguna solicitud vinculada a este identificador. Por favor, verifica el enlace recibido en tu correo electrónico." />;
  }

  if (!request) {
    return <ErrorState title="Enlace no válido" description="No se ha encontrado ninguna solicitud vinculada a este identificador. Por favor, verifica el enlace recibido en tu correo electrónico." />;
  }

  const isApproved = request.request_status === "approved";
  const isExpired = request.expires_at ? new Date() > new Date(request.expires_at) : true;

  if (!isApproved) {
    return <ErrorState title="Acceso no aprobado" description="Esta solicitud aún no ha sido aprobada por la curaduría científica de la Fonoteca IIAP o se encuentra rechazada." />;
  }

  if (isExpired) {
    return <ErrorState title="Enlace Expirado" description="Este enlace de descarga efímero (válido por 48 horas) ha caducado de forma automática por políticas de seguridad bioacústica." />;
  }

  const rawItems = (request.audio_request_items || [])
    .map((item: any) => item.multimedia)
    .filter(Boolean);

  const items = await Promise.all(
    rawItems.map(async (item: any) => {
      let downloadUrl = "";
      if (item.identifier) {
        downloadUrl = await getDownloadUrl(item.identifier);
      }
      return {
        ...item,
        scientificName: item.occurrences?.taxa?.scientificName || item.occurrence?.taxon?.scientificName || "Especie no identificada",
        downloadUrl,
      };
    })
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Fonoteca IIAP
              </span>
              <span className="block text-xs text-slate-400 font-medium">
                Portal de Descargas Científicas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Enlace Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solicitud Aprobada
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Archivos Bioacústicos Concedidos
              </h1>
            </div>

            {request.expires_at && (
              <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Vencimiento de Acceso</div>
                  <div className="text-xs font-medium text-slate-200">
                    {new Date(request.expires_at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Investigador Solicitante</span>
                <span className="font-semibold text-slate-200">{request.requester_name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Institución</span>
                <span className="font-semibold text-slate-200">{request.institution}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Fecha de Emisión</span>
                <span className="font-semibold text-slate-200">
                  {new Date(request.created_at).toLocaleDateString("es-PE")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-emerald-400" />
              <span>Listado de Grabaciones ({items.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((item: any, idx: number) => (
              <div 
                key={item.id || idx}
                className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {item.title || "Grabación de Audio"}
                    </span>
                    {item.format && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.format}
                      </span>
                    )}
                  </div>
                  <p className="text-xs italic text-emerald-400/90 font-mono">
                    {item.scientificName}
                  </p>
                </div>

                {item.downloadUrl ? (
                  <a
                    href={item.downloadUrl}
                    download
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Archivo</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No disponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Instituto de Investigaciones de la Amazonía Peruana (IIAP). Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl text-center space-y-4 shadow-2xl backdrop-blur-sm">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Regresar al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
