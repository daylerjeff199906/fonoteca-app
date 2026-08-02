"use server";

import { revalidatePath } from "next/cache";
import { MultimediaInput, multimediaSchema } from "@/lib/validations/fonoteca";
import { Multimedia } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud } from "@/lib/backend/crud";
import { FileServiceError, uploadFileToFileService, deleteFileFromFileService, getFileThumbnail } from "@/lib/file-service";

export type MultimediaPreview = {
  multimediaId: string;
  url: string;
  status?: string;
  contentType?: string;
};

/** URLs firmadas frescas de las variantes optimizadas para el viewport actual. */
type PreviewableMultimedia = Pick<Multimedia, "id" | "file_id" | "identifier" | "type"> & {
  /** Compatibilidad con relaciones aún entregadas por la API en camelCase. */
  fileId?: string | null;
  processing_status?: Multimedia["processing_status"];
  processingStatus?: Multimedia["processing_status"];
};

export async function getMultimediaPreviews(items: PreviewableMultimedia[]) {
  const imageItems = items
    .map((item) => ({ ...item, resolvedFileId: item.file_id ?? item.fileId }))
    .filter((item) => item.type === "Still")
    .slice(0, 50);
  const results = await Promise.allSettled(imageItems.map(async (item) => {
    // Registros históricos pueden no tener file_id porque fueron creados
    // antes de Files API. Conservamos su URL existente como respaldo.
    if (!item.resolvedFileId) {
      return { multimediaId: item.id, url: item.identifier, status: "legacy" } satisfies MultimediaPreview;
    }

    let thumbnail: Awaited<ReturnType<typeof getFileThumbnail>>;
    try {
      thumbnail = await getFileThumbnail(item.resolvedFileId);
    } catch (error) {
      // Un 404 significa que el archivo no está en el registro de este
      // proyecto (por ejemplo, multimedia previa a la migración). No debe
      // impedir que el administrador muestre la imagen ya guardada.
      if (error instanceof FileServiceError && error.status === 404 && item.identifier) {
        return { multimediaId: item.id, url: item.identifier, status: "legacy" } satisfies MultimediaPreview;
      }
      throw error;
    }
    if (!thumbnail.data.url && thumbnail.status === 200) {
      throw new Error("El File Service respondió una miniatura sin URL.");
    }
    // El worker termina fuera de la aplicación. Persistimos ese estado al ver
    // la variante para que futuras visitas no mantengan el placeholder.
    if (thumbnail.status === 200 && thumbnail.data.url &&
        (item.processing_status ?? item.processingStatus) !== "completed") {
      try {
        await mutateCrud("multimedia", "PATCH", {
          processingStatus: "completed",
          ...(thumbnail.data.key ? { processedKey: thumbnail.data.key } : {}),
        }, item.id);
      } catch (error) {
        // La URL sigue siendo utilizable aunque la sincronización del estado
        // falle temporalmente; se intentará de nuevo en la siguiente carga.
        console.warn("No se pudo actualizar el estado de la miniatura:", error);
      }
    }
    return {
      multimediaId: item.id,
      url: thumbnail.data.url ?? "",
      status: thumbnail.status === 202 ? "processing" : "completed",
    } satisfies MultimediaPreview;
  }));
  const data = results.flatMap((result) => result.status === "fulfilled" && result.value.url ? [result.value] : []);
  const pending = results.some((result) => result.status === "fulfilled" && result.value.status === "processing");
  const errors = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
  return { data, pending, error: errors[0]?.reason instanceof Error ? errors[0].reason.message : undefined };
}

function toBackendMultimedia(input: Record<string, any>) {
  const { occurrence_id, event_id, file_id, file_key, file_metadata, processing_job_id, processing_status, processed_key, creator_id, created_by_id, guano_metadata, order_index, parent_multimedia_id, record_status, is_public, duration_seconds, file_size_bytes, vocalization_type, background_species, ...rest } = input;
  return {
    ...rest,
    ...(occurrence_id !== undefined ? { occurrenceId: occurrence_id } : {}),
    ...(event_id !== undefined ? { eventId: event_id } : {}),
    ...(file_id !== undefined ? { fileId: file_id } : {}),
    ...(file_key !== undefined ? { fileKey: file_key } : {}),
    ...(file_metadata !== undefined ? { fileMetadata: file_metadata } : {}),
    ...(processing_job_id !== undefined ? { processingJobId: processing_job_id } : {}),
    ...(processing_status !== undefined ? { processingStatus: processing_status } : {}),
    ...(processed_key !== undefined ? { processedKey: processed_key } : {}),
    ...(creator_id !== undefined ? { creatorId: creator_id } : {}),
    ...(created_by_id !== undefined ? { createdById: created_by_id } : {}),
    ...(guano_metadata !== undefined ? { guanoMetadata: guano_metadata } : {}),
    ...(order_index !== undefined ? { orderIndex: order_index } : {}),
    ...(parent_multimedia_id !== undefined ? { parentMultimediaId: parent_multimedia_id } : {}),
    ...(record_status !== undefined ? { recordStatus: record_status } : {}),
    ...(is_public !== undefined ? { isPublic: is_public } : {}),
    ...(duration_seconds !== undefined ? { durationSeconds: duration_seconds } : {}),
    ...(file_size_bytes !== undefined ? { fileSizeBytes: file_size_bytes } : {}),
    ...(vocalization_type !== undefined ? { vocalizationType: vocalization_type } : {}),
    ...(background_species !== undefined ? { backgroundSpecies: background_species } : {}),
  };
}

function fromBackendMultimedia(item: any) {
  return {
    ...item,
    occurrence_id: item.occurrence_id ?? item.occurrenceId ?? null,
    event_id: item.event_id ?? item.eventId ?? null,
    file_id: item.file_id ?? item.fileId ?? null,
    file_key: item.file_key ?? item.fileKey ?? null,
    file_metadata: item.file_metadata ?? item.fileMetadata ?? null,
    processing_job_id: item.processing_job_id ?? item.processingJobId ?? null,
    processing_status: item.processing_status ?? item.processingStatus ?? null,
    processed_key: item.processed_key ?? item.processedKey ?? null,
    creator_id: item.creator_id ?? item.creatorId ?? null,
    created_by_id: item.created_by_id ?? item.createdById ?? null,
    guano_metadata: item.guano_metadata ?? item.guanoMetadata ?? {},
    order_index: item.order_index ?? item.orderIndex ?? 0,
    parent_multimedia_id: item.parent_multimedia_id ?? item.parentMultimediaId ?? null,
    record_status: item.record_status ?? item.recordStatus ?? "draft",
    is_public: item.is_public ?? item.isPublic ?? true,
    duration_seconds: item.duration_seconds ?? item.durationSeconds ?? null,
    file_size_bytes: item.file_size_bytes ?? item.fileSizeBytes ?? null,
  };
}

export async function getMultimediaList({
  page = 1,
  limit = 10,
  occurrence_id = "",
  type = "",
}: {
  page?: number;
  limit?: number;
  occurrence_id?: string;
  type?: string;
}) {
  try {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (occurrence_id) params.occurrenceId = occurrence_id;
    if (type) params.type = type;

    const result = await getCrudPage<any>("multimedia", params);
    const formattedData = (result.data || []).map((rawItem: any) => {
      const item = fromBackendMultimedia(rawItem);
      return {
        ...item,
        occurrence: item.occurrences ? {
          ...item.occurrences,
          taxon: item.occurrences.taxa
        } : item.occurrence
      }
    }) as Multimedia[];

    return {
      data: formattedData,
      count: result.meta?.totalItems ?? formattedData.length,
    };
  } catch (error) {
    console.error("error fetching multimedia:", error);
    return { data: [] as Multimedia[], count: 0, error: error instanceof Error ? error.message : "Error al cargar multimedia" };
  }
}

export async function getMultimedia(id: string) {
  try {
    const data = await getCrudItem<any>("multimedia", id);
    const normalized = fromBackendMultimedia(data);
    const formattedData = {
      ...normalized,
      occurrence: data?.occurrences ? {
        ...data.occurrences,
        taxon: data.occurrences.taxa
      } : normalized?.occurrence
    } as Multimedia;

    return { data: formattedData };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cargar multimedia" };
  }
}

export async function createMultimedia(input: MultimediaInput) {
  const parsed = multimediaSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = Object.values(parsed.error.flatten().fieldErrors).flat().join(", ");
    return { error: errorMsg || "Datos de multimedia inválidos" };
  }

  try {
    // La relación se persiste en la API de dominio, no en el servicio de archivos.
    // Si la ocurrencia pertenece a un evento, guardamos ambos vínculos de forma consistente.
    let payload = parsed.data;
    if (payload.occurrence_id && !payload.event_id) {
      const occurrence = await getCrudItem<{ event_id?: string | null; eventId?: string | null }>("occurrences", payload.occurrence_id);
      payload = { ...payload, event_id: occurrence.event_id ?? occurrence.eventId ?? null };
    }
    const data = await mutateCrud<any>("multimedia", "POST", toBackendMultimedia(payload));
    revalidatePath("/dashboard/multimedia");
    if (payload.occurrence_id) revalidatePath(`/dashboard/occurrences/${payload.occurrence_id}`);
    if (payload.event_id) revalidatePath(`/dashboard/collections/events/${payload.event_id}/occurrences`);
    return { success: true, data: fromBackendMultimedia(data) as Multimedia };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear multimedia" };
  }
}

export async function updateMultimedia(id: string, input: MultimediaInput) {
  const parsed = multimediaSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = Object.values(parsed.error.flatten().fieldErrors).flat().join(", ");
    return { error: errorMsg || "Datos de multimedia inválidos" };
  }

  try {
    const data = await mutateCrud<any>("multimedia", "PATCH", toBackendMultimedia(parsed.data), id);
    revalidatePath("/dashboard/multimedia");
    revalidatePath(`/dashboard/multimedia/${id}`);
    return { success: true, data: fromBackendMultimedia(data) as Multimedia };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar multimedia" };
  }
}

export async function deleteMultimedia(id: string) {
  try {
    // 1. Fetch item to check identifier
    let item: any = null;
    try {
      item = await getCrudItem<any>("multimedia", id);
    } catch {
      // Continue if item not found
    }

    // 2. El Files API recibe exclusivamente su UUID, nunca una URL firmada,
    // nombre de archivo o key. Si falla, conservamos el registro para reintentar.
    const fileId = item?.file_id ?? item?.fileId ?? null;
    if (fileId) {
      try {
        await deleteFileFromFileService(fileId);
      } catch (fileErr) {
        console.error("Failed to delete file from Files API:", fileErr);
        return { error: fileErr instanceof Error ? fileErr.message : "No se pudo eliminar el archivo del servicio multimedia" };
      }
    }

    // 3. Elimina el vínculo y los metadatos del backend de dominio.
    await mutateCrud("multimedia", "DELETE", undefined, id);

    revalidatePath("/dashboard/multimedia");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar multimedia" };
  }
}

export async function deleteR2Folder(_prefix: string) {
  // Deprecated folder cleanup stub for Files API
  return { success: true };
}

export async function getPresignedUrl(_path: string, _contentType: string) {
  return { success: false, error: "Obsolete endpoint. Use Files API upload endpoint." };
}

export async function bulkUpdateMultimediaIndexes(updates: { id: string; order_index: number }[]) {
  try {
    for (const update of updates) {
      await mutateCrud("multimedia", "PATCH", { orderIndex: update.order_index }, update.id);
    }
    revalidatePath("/dashboard/multimedia");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar índices" };
  }
}

export async function uploadToFileService(formData: FormData): Promise<{ success: boolean; url?: string; originalUrl?: string; file?: any; error?: string }> {
  try {
    if (!formData.has("duplicate_policy")) {
      formData.append("duplicate_policy", "reuse");
    }
    if (!formData.has("process_image")) {
      formData.append("process_image", "true");
    }
    if (!formData.has("process_audio")) {
      formData.append("process_audio", "true");
    }

    const result = await uploadFileToFileService(formData);
    // Files API devuelve una URL prefirmada para la variante cuando procesa
    // una imagen. No se debe reconstruir ni modificar: ruta y query forman
    // parte de la firma S3/MinIO.
    return {
      success: true,
      url: result.processed?.url ?? result.url,
      originalUrl: result.url,
      file: result,
    };
  } catch (err: any) {
    console.error("Files API upload error:", err);
    return { success: false, error: err.message || "Error al subir archivo" };
  }
}

// Keep uploadToR2 alias for backward compatibility with existing components
export async function uploadToR2(formData: FormData) {
  return uploadToFileService(formData);
}

export async function deleteFileFromFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  if (!fileId) {
    return { success: false, error: "Se requiere el UUID del archivo" };
  }

  try {
    await deleteFileFromFileService(fileId);
    return { success: true };
  } catch (err: any) {
    console.error("Files API delete error:", err);
    return { success: false, error: err.message || "Error al eliminar archivo" };
  }
}

// Keep deleteFileFromR2 alias for backward compatibility with existing components
export async function deleteFileFromR2(fileId: string) {
  return deleteFileFromFile(fileId);
}
