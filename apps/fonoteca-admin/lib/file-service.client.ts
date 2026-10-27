import {
  fileServiceResponseSchema,
  uploadInputSchema,
  type UploadedFile,
} from "@/lib/file-service.schemas";

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const value = "detail" in payload ? payload.detail : "message" in payload ? payload.message : null;
    if (typeof value === "string") return value;
  }
  return fallback;
}

/**
 * El navegador solo habla con el proxy interno. El token del servicio nunca
 * llega al cliente ni se mezcla con los datos que se guardan en el backend.
 */
export async function uploadFile(input: unknown): Promise<UploadedFile> {
  const data = uploadInputSchema.parse(input);
  const form = new FormData();
  form.append("file", data.file);
  form.append("process_image", String(data.processImage));
  form.append("process_audio", String(data.processAudio));
  form.append("duplicate_policy", data.duplicatePolicy);
  form.append("pending", String(data.pending));
  if (data.resourceType) form.append("resource_type", data.resourceType);
  form.append("metadata", JSON.stringify(data.metadata));

  const response = await fetch("/api/files/upload", { method: "POST", body: form });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(payload, "No se pudo subir el archivo"));
  }

  return fileServiceResponseSchema.parse(payload);
}

/**
 * Igual que uploadFile, pero informa el avance de la subida (fetch no lo permite).
 * El navegador solo habla con el proxy interno, que valida sesión, rol y contenido.
 */
export function uploadFileWithProgress(
  input: unknown,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadedFile> {
  const data = uploadInputSchema.parse(input);
  const form = new FormData();
  form.append("file", data.file);
  form.append("process_image", String(data.processImage));
  form.append("process_audio", String(data.processAudio));
  form.append("duplicate_policy", data.duplicatePolicy);
  form.append("pending", String(data.pending));
  if (data.resourceType) form.append("resource_type", data.resourceType);
  form.append("metadata", JSON.stringify(data.metadata));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onerror = () => reject(new Error("Se perdió la conexión durante la carga. Revise su red e inténtelo nuevamente."));
    xhr.onabort = () => reject(new Error("La carga fue cancelada."));
    xhr.onload = () => {
      let payload: unknown = null;
      try { payload = JSON.parse(xhr.responseText); } catch { /* respuesta sin JSON */ }
      if (xhr.status < 200 || xhr.status >= 300) {
        const fallback = xhr.status === 401 ? "Su sesión expiró. Inicie sesión nuevamente."
          : xhr.status === 403 ? "Su rol no tiene permiso para subir archivos."
          : "No se pudo subir el archivo";
        return reject(new Error(errorMessage(payload, fallback)));
      }
      try {
        onProgress(100);
        resolve(fileServiceResponseSchema.parse(payload));
      } catch {
        reject(new Error("El servicio de archivos devolvió una respuesta inesperada."));
      }
    };
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
}
