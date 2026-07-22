import "server-only";

const FILE_SERVICE_URL = (process.env.FILE_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");
const FILE_SERVICE_PROJECT_ID = process.env.FILE_SERVICE_PROJECT_ID || "fonoteca";
const FILE_SERVICE_API_KEY = process.env.FILE_SERVICE_API_KEY || "";

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
  const headers: Record<string, string> = {};
  if (FILE_SERVICE_PROJECT_ID) {
    headers["X-Project-Id"] = FILE_SERVICE_PROJECT_ID;
  }
  if (FILE_SERVICE_API_KEY) {
    headers["X-Api-Key"] = FILE_SERVICE_API_KEY;
  }
  return headers;
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
    const errorMsg = payload?.detail || payload?.message || `Error ${response.status} en la carga de archivo`;
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
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
    const errorMsg = payload?.detail || payload?.message || `Error ${response.status} en la carga múltiple`;
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
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
    const errorMsg = payload?.detail || payload?.message || `Error ${response.status} al obtener variante de imagen`;
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
  }

  return payload as FileServiceImageVariant;
}

/**
 * Elimina un archivo registrado en Files API Service
 */
export async function deleteFileFromFileService(fileId: string): Promise<{ success: boolean; message?: string }> {
  // Extract UUID if fileId is a full path or key or URL
  const cleanId = fileId.includes("/") ? fileId.split("/").pop() || fileId : fileId;

  const response = await fetch(`${FILE_SERVICE_URL}/api/files/${cleanId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const errorMsg = payload?.detail || payload?.message || `Error ${response.status} al eliminar archivo`;
    throw new Error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
  }

  return { success: true };
}
