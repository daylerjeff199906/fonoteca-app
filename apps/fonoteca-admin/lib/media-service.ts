import "server-only";

import { fetchWithSession } from "@/lib/backend/auth";
import type { UploadedFile } from "@/lib/file-service.schemas";

/**
 * Cliente del módulo de multimedia del backend. El backend valida, guarda y procesa los archivos; el panel solo
 * reenvía la petición con la sesión del usuario. No hay un token de servicio: los permisos los decide el backend.
 */
export class MediaServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "MediaServiceError";
  }
}

export interface MediaFileState extends UploadedFile {
  status: "queued" | "processing" | "completed" | "failed";
  error_code?: string | null;
  duration_seconds?: number;
}

function mediaUrl(path: string) {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
  return `${base.replace(/\/$/, "")}/media/files${path}`;
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const body = payload as { message?: unknown; detail?: unknown; error?: unknown };
  const nested = body.error && typeof body.error === "object" ? (body.error as { message?: unknown }).message : body.error;
  const candidate = nested ?? body.message ?? body.detail;
  if (typeof candidate === "string") return candidate;
  if (Array.isArray(candidate)) return candidate.filter((item): item is string => typeof item === "string").join(" ");
  return fallback;
}

async function request<T>(path: string, init: RequestInit, fallback: string): Promise<T> {
  const response = await fetchWithSession(mediaUrl(path), init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new MediaServiceError(errorMessage(payload, fallback), response.status);
  return (payload && typeof payload === "object" && "data" in payload ? (payload as { data: T }).data : payload) as T;
}

/** Sube un archivo. El backend responde de inmediato; los derivados se generan en segundo plano. */
export function uploadMediaFile(formData: FormData): Promise<MediaFileState> {
  return request<MediaFileState>("", { method: "POST", body: formData }, "No se pudo subir el archivo.");
}

export function getMediaFile(fileId: string): Promise<MediaFileState> {
  return request<MediaFileState>(`/${encodeURIComponent(fileId)}`, { method: "GET" }, "No se pudo consultar el archivo.");
}

/** El backend rechaza con 409 el borrado de un archivo que aún usa algún multimedia. */
export async function deleteMediaFile(fileId: string): Promise<void> {
  await request<unknown>(`/${encodeURIComponent(fileId)}`, { method: "DELETE" }, "No se pudo eliminar el archivo.");
}
