import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

export const revalidate = 0; // Dynamic route

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
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour link
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

  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  // Fetch the request details with related items and their scientific names
  const { data: request, error } = await supabase
    .from("audio_requests")
    .select(`
      *,
      audio_request_items (
        multimedia (
          id,
          title,
          type,
          format,
          creator,
          identifier,
          duration_seconds,
          occurrences (
            id,
            taxa (
              id,
              scientificName
            )
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !request) {
    return <ErrorState title="Enlace no válido" description="No se ha encontrado ninguna solicitud vinculada a este identificador. Por favor, verifica el enlace recibido en tu correo electrónico." />;
  }

  // Check approval status and expiration
  const isApproved = request.request_status === "approved";
  const isExpired = request.expires_at ? new Date() > new Date(request.expires_at) : true;

  if (!isApproved) {
    return <ErrorState title="Acceso no aprobado" description="Esta solicitud aún no ha sido aprobada por la curaduría científica de la Fonoteca IIAP o se encuentra rechazada." />;
  }

  if (isExpired) {
    return <ErrorState title="Enlace Expirado" description="Este enlace de descarga efímero (válido por 48 horas) ha caducado de forma automática por políticas de seguridad bioacústica." />;
  }

  // Format the items list and generate presigned URLs
  const rawItems = (request.audio_request_items || [])
    .map((item: any) => {
      if (!item.multimedia) return null;
      return item.multimedia;
    })
    .filter(Boolean);

  const items = await Promise.all(
    rawItems.map(async (item: any) => {
      const presignedUrl = await getDownloadUrl(item.identifier);
      return {
        id: item.id,
        title: item.title || "Grabación de audio",
        scientificName: item.occurrences?.taxa?.scientificName,
        format: item.format,
        duration: item.duration_seconds,
        downloadUrl: presignedUrl,
      };
    })
  );

  const formattedExpiry = new Date(request.expires_at!).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center py-12 px-4 selection:bg-emerald-500 selection:text-slate-900">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Music className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">FONOTECA CIENTÍFICA IIAP</h1>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Portal Efímero de Descargas</p>
          </div>
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 p-5 rounded-xl border border-slate-800/50">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" /> Investigador
              </span>
              <p className="text-sm font-bold text-slate-200">{request.requester_name}</p>
              <p className="text-[11px] text-slate-400 font-mono leading-none">{request.requester_email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Institución
              </span>
              <p className="text-sm font-bold text-slate-200">{request.institution || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400 animate-pulse" /> Expira el
              </span>
              <p className="text-sm font-black text-emerald-400">{formattedExpiry}</p>
              <p className="text-[10px] text-emerald-500 font-bold leading-none uppercase tracking-widest">Enlace temporal</p>
            </div>
          </div>

          {/* Guidelines disclaimer */}
          <div className="flex gap-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/40 text-xs text-slate-400 leading-normal">
            <Lock className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              Al descargar estos archivos, te comprometes a citar la base de datos de la <strong>Fonoteca IIAP</strong> bajo el estándar <strong>Darwin Core</strong> y a no redistribuir ni comercializar el material sin dar los créditos científicos correspondientes.
            </p>
          </div>

          {/* Files List */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Archivos Listos para Descarga ({items.length})</h3>
            
            <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
              {items.map((file) => (
                <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <FileAudio className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{file.title}</h4>
                      {file.scientificName ? (
                        <p className="text-xs text-emerald-400 font-semibold italic mt-0.5">
                          {file.scientificName}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5">Grabación general</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex gap-2">
                      {file.format && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase">
                          {file.format}
                        </span>
                      )}
                      {file.duration && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400">
                          {file.duration.toFixed(1)}s
                        </span>
                      )}
                    </div>

                    <a
                      href={file.downloadUrl}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Descargar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 font-medium tracking-wide">
          © {new Date().getFullYear()} Instituto de Investigaciones de la Amazonía Peruana - IIAP. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center py-12 px-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center space-y-6 bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-8 shadow-2xl">
        <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-black text-white">{title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <Link
            href="/"
            className="inline-block w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-colors"
          >
            Volver al Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
