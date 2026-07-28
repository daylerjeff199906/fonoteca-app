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
  form.append("metadata", JSON.stringify(data.metadata));

  const response = await fetch("/api/files/upload", { method: "POST", body: form });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(payload, "No se pudo subir el archivo"));
  }

  return fileServiceResponseSchema.parse(payload);
}
