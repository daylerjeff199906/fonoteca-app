const MEDIA_URL_FILE_ID = /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?:original|variants)\//i;

/**
 * Identificador del archivo a partir de una URL pública de multimedia
 * (`.../files/<proyecto>/<recurso>/<id>/original/foto.jpg` o `.../<id>/variants/display.webp`).
 * Devuelve null si la URL no pertenece al almacenamiento gestionado por el backend.
 */
export function fileIdFromMediaUrl(url: string | null | undefined): string | null {
  return url?.match(MEDIA_URL_FILE_ID)?.[1] ?? null;
}
