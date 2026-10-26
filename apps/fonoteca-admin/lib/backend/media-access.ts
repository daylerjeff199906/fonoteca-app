import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/backend/auth";
import { canWriteMedia } from "@/lib/media-permissions";
import { validateMediaBytes, validateMediaMeta } from "@/lib/media-rules";

/**
 * Protege las rutas y acciones que usan el token del servicio de archivos: sin esta
 * comprobación cualquier visitante podría subir o borrar archivos con ese token.
 * Devuelve la respuesta de error, o null si el usuario puede continuar.
 */
export async function requireMediaWrite(): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: "Debe iniciar sesión para gestionar archivos." }, { status: 401 });
  if (!canWriteMedia(user)) {
    return NextResponse.json({ detail: "Su rol no tiene permiso para subir o eliminar archivos." }, { status: 403 });
  }
  return null;
}

/** Variante para acciones del servidor: lanza un error con mensaje comprensible. */
export async function assertMediaWrite(): Promise<void> {
  const denied = await requireMediaWrite();
  if (denied) {
    const body = (await denied.json()) as { detail: string };
    throw new Error(body.detail);
  }
}

/**
 * Valida en el servidor los archivos de un multipart (extensión, MIME, tamaño y firma
 * del contenido). La validación del navegador es solo una ayuda: esta no se puede omitir.
 */
export async function validateUploadFiles(formData: FormData, field: string): Promise<NextResponse | null> {
  const files = formData.getAll(field).filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ detail: "Seleccione un archivo para subir." }, { status: 400 });
  }

  for (const file of files) {
    const meta = validateMediaMeta({ name: file.name, size: file.size, type: file.type });
    if (!meta.ok) {
      return NextResponse.json({ detail: meta.error }, { status: file.size > 0 && /supera/.test(meta.error) ? 413 : 415 });
    }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const content = validateMediaBytes(file.name, head);
    if (!content.ok) return NextResponse.json({ detail: content.error }, { status: 415 });
  }
  return null;
}
