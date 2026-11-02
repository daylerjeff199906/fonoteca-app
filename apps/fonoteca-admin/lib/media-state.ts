import type { UploadedFile } from "@/lib/media-file.schemas";

/** Estado de un archivo del backend: cada derivado aparece en `assets` cuando termina de generarse. */
export interface MediaFileState extends UploadedFile {
  status: "queued" | "processing" | "completed" | "failed";
  error_code?: string | null;
  duration_seconds?: number;
}

/** Campos de un multimedia que dependen del procesamiento en el backend. */
export interface LiveMediaItem {
  id: string;
  type?: string | null;
  identifier?: string | null;
  file_id?: string | null;
  thumbnail_url?: string | null;
  display_url?: string | null;
  audio_url?: string | null;
  processing_status?: string | null;
}

const STILL = "Still";
const SOUND = "Sound";

/** Archivos subidos por el panel actual tienen `file_id`; los anteriores solo conservan su URL en `identifier`. */
export const isManagedMedia = (item: LiveMediaItem) => Boolean(item.file_id);

/**
 * Miniatura para listados y tarjetas. Un archivo gestionado muestra solo su `thumbnail_url` (null mientras se
 * genera); el original nunca se usa aquí. Los registros históricos sin archivo gestionado no tienen otra imagen.
 */
export function thumbnailSrc(item: LiveMediaItem): string | null {
  if (item.type !== STILL) return null;
  if (!isManagedMedia(item)) return item.identifier || null;
  return item.thumbnail_url || null;
}

/** Imagen para vistas de detalle y previsualización: la versión de pantalla y, si falta, el original. */
export function detailSrc(item: LiveMediaItem): string | null {
  if (item.type !== STILL) return null;
  return item.display_url || item.identifier || null;
}

/** Audio reproducible: la versión OGG procesada y, mientras no exista, el original. */
export function audioSrc(item: LiveMediaItem): string {
  return (item.type === SOUND && item.audio_url) || item.identifier || "";
}

/** True mientras el archivo gestionado aún no tiene el derivado que necesita su tipo. */
export function isAwaitingDerivative(item: LiveMediaItem): boolean {
  if (!isManagedMedia(item) || item.processing_status === "failed") return false;
  if (item.type === STILL) return !item.thumbnail_url;
  if (item.type === SOUND) return !item.audio_url;
  return false;
}
