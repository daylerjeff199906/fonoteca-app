import "server-only";

// En Windows, `localhost` puede resolver a ::1 y alcanzar otro servicio de
// WSL/Docker. Normalizamos solo el destino local; las URLs de producción no
// se modifican.
const configuredFileServiceUrl = (process.env.FILE_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const FILE_SERVICE_URL = configuredFileServiceUrl === "http://localhost:8000"
  ? "http://127.0.0.1:8000"
  : configuredFileServiceUrl;
const FILE_SERVICE_TOKEN = process.env.FILE_SERVICE_TOKEN || "";

export class FileServiceError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "FileServiceError";
  }
}

export interface FileServiceResource {
  id: string;
  project_id: string;
  filename: string;
  content_type: string;
  size: number;
  sha256: string;
  key: string;
  url: string;
  /**
   * Variante creada por Files API. Su URL puede estar firmada, por lo que debe
   * consumirse exactamente como llega del servicio.
   */
  processed?: {
    key: string;
    url: string;
    content_type: string;
    width?: number;
    height?: number;
  };
  metadata?: Record<string, any>;
  duplicate: boolean;
}

export interface FileServiceImageVariant {
  id: string;
  cached: boolean;
  url: string;
  key: string;
  content_type: string;
}

export interface FileServiceUploadMultipleResult {
  uploaded_count: number;
  failed_count: number;
  results: Array<{ id: string; filename: string; duplicate: boolean; url: string; key: string }>;
  errors: Array<{ filename: string; status: number; detail: string }>;
}

function getHeaders(): Record<string, string> {
  if (!FILE_SERVICE_TOKEN) {
    throw new FileServiceError("FILE_SERVICE_TOKEN no está configurado en el servidor", 500);
  }
  return { Authorization: `Bearer ${FILE_SERVICE_TOKEN}` };
}

function responseError(payload: any, status: number, fallback: string): FileServiceError {
  const detail = payload?.detail ?? payload?.message ?? payload?.error;
  const message = typeof detail === "string" ? detail : Array.isArray(detail)
    ? detail.map((item) => `${Array.isArray(item?.loc) ? item.loc.join(".") + ": " : ""}${item?.msg ?? String(item)}`).join(", ")
    : fallback;
  return new FileServiceError(message, status);
}

/**
 * Carga un archivo a través de Files API Service
 */
export async function uploadFileToFileService(formData: FormData): Promise<FileServiceResource> {
  const response = await fetch(`${FILE_SERVICE_URL}/api/files/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw responseError(payload, response.status, `Error ${response.status} en la carga de archivo`);
  }

  return payload as FileServiceResource;
}

/**
 * Carga múltiples archivos a través de Files API Service
 */
export async function uploadMultipleFilesToFileService(formData: FormData): Promise<FileServiceUploadMultipleResult> {
  const response = await fetch(`${FILE_SERVICE_URL}/api/files/upload-multiple`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw responseError(payload, response.status, `Error ${response.status} en la carga múltiple`);
  }

  return payload as FileServiceUploadMultipleResult;
}

/**
 * Genera u obtiene una variante de imagen mediante Files API Service
 */
export async function getFileImageVariant(
  fileId: string,
  options: { w?: number; h?: number; fit?: 'inside' | 'cover'; q?: number; format?: 'webp' | 'jpeg' | 'png' } = {}
): Promise<FileServiceImageVariant> {
  const params = new URLSearchParams();
  if (options.w) params.set("w", String(options.w));
  if (options.h) params.set("h", String(options.h));
  if (options.fit) params.set("fit", options.fit);
  if (options.q) params.set("q", String(options.q));
  if (options.format) params.set("format", options.format);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${FILE_SERVICE_URL}/api/files/${fileId}/image${queryString}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw responseError(payload, response.status, `Error ${response.status} al obtener variante de imagen`);
  }

  return payload as FileServiceImageVariant;
}

/**
 * Elimina un archivo registrado en Files API Service
 */
export async function deleteFileFromFileService(fileId: string): Promise<{ success: boolean; message?: string }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fileId)) {
    throw new FileServiceError("Se requiere el UUID del archivo para eliminarlo", 400);
  }

  const response = await fetch(`${FILE_SERVICE_URL}/api/files/${fileId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw responseError(payload, response.status, `Error ${response.status} al eliminar archivo`);
  }

  return { success: true };
}
