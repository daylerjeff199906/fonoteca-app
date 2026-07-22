"use server";

import { revalidatePath } from "next/cache";
import { MultimediaInput, multimediaSchema } from "@/lib/validations/fonoteca";
import { Multimedia } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud } from "@/lib/backend/crud";
import { uploadFileToFileService, deleteFileFromFileService } from "@/lib/file-service";

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
    if (occurrence_id) params.occurrence_id = occurrence_id;
    if (type) params.type = type;

    const result = await getCrudPage<any>("multimedia", params);
    const formattedData = (result.data || []).map((item: any) => ({
      ...item,
      occurrence: item.occurrences ? {
        ...item.occurrences,
        taxon: item.occurrences.taxa
      } : item.occurrence
    })) as Multimedia[];

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
    const formattedData = {
      ...data,
      occurrence: data?.occurrences ? {
        ...data.occurrences,
        taxon: data.occurrences.taxa
      } : data?.occurrence
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
    const data = await mutateCrud<any>("multimedia", "POST", parsed.data);
    revalidatePath("/dashboard/multimedia");
    return { success: true, data: data as Multimedia };
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
    const data = await mutateCrud<any>("multimedia", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/multimedia");
    revalidatePath(`/dashboard/multimedia/${id}`);
    return { success: true, data: data as Multimedia };
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
      await mutateCrud("multimedia", "PATCH", { order_index: update.order_index }, update.id);
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
