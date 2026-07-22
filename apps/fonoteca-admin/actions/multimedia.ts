"use server";

import { revalidatePath } from "next/cache";
import { MultimediaInput, multimediaSchema } from "@/lib/validations/fonoteca";
import { Multimedia } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud } from "@/lib/backend/crud";
import { uploadFileToFileService, deleteFileFromFileService } from "@/lib/file-service";

function toBackendMultimedia(input: Record<string, any>) {
  const { occurrence_id, event_id, creator_id, created_by_id, guano_metadata, order_index, parent_multimedia_id, record_status, is_public, duration_seconds, file_size_bytes, vocalization_type, background_species, ...rest } = input;
  return {
    ...rest,
    ...(occurrence_id !== undefined ? { occurrenceId: occurrence_id } : {}),
    ...(event_id !== undefined ? { eventId: event_id } : {}),
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
    }}) as Multimedia[];

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

    // 2. Delete from database
    await mutateCrud("multimedia", "DELETE", undefined, id);

    // 3. Delete from Files API if identifier exists
    if (item && item.identifier) {
      try {
        await deleteFileFromFileService(item.identifier);
      } catch (fileErr) {
        console.error("Failed to delete file from Files API:", fileErr);
      }
    }

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

export async function uploadToFileService(formData: FormData): Promise<{ success: boolean; url?: string; file?: any; error?: string }> {
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
    return { success: true, url: result.url, file: result };
  } catch (err: any) {
    console.error("Files API upload error:", err);
    return { success: false, error: err.message || "Error al subir archivo" };
  }
}

// Keep uploadToR2 alias for backward compatibility with existing components
export async function uploadToR2(formData: FormData) {
  return uploadToFileService(formData);
}

export async function deleteFileFromFile(urlOrId: string): Promise<{ success: boolean; error?: string }> {
  if (!urlOrId) {
    return { success: false, error: "No URL or File ID provided" };
  }

  try {
    await deleteFileFromFileService(urlOrId);
    return { success: true };
  } catch (err: any) {
    console.error("Files API delete error:", err);
    return { success: false, error: err.message || "Error al eliminar archivo" };
  }
}

// Keep deleteFileFromR2 alias for backward compatibility with existing components
export async function deleteFileFromR2(urlOrId: string) {
  return deleteFileFromFile(urlOrId);
}
