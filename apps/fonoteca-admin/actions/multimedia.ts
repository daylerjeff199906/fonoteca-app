"use server";

import { revalidatePath } from "next/cache";
import { MultimediaInput, multimediaSchema } from "@/lib/validations/fonoteca";
import { Multimedia } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud } from "@/lib/backend/crud";
import { 
  DeleteObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectsCommand, 
  PutObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";

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

    // 3. Delete from R2 bucket if url belongs to R2
    if (item && item.identifier && item.identifier.startsWith(R2_PUBLIC_URL)) {
      try {
        const path = item.identifier.replace(`${R2_PUBLIC_URL}/`, "");
        const command = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: path,
        });
        await r2Client.send(command);
      } catch (r2Err) {
        console.error("Failed to delete from R2:", r2Err);
      }
    }

    revalidatePath("/dashboard/multimedia");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar multimedia" };
  }
}

export async function deleteR2Folder(prefix: string) {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
    });

    const listResp = await r2Client.send(listCommand);

    if (listResp.Contents && listResp.Contents.length > 0) {
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: {
          Objects: listResp.Contents.map((obj) => ({ Key: obj.Key })),
          Quiet: true,
        },
      });

      await r2Client.send(deleteCommand);
    }
    return { success: true };
  } catch (err: any) {
    console.error(`Failed to delete R2 folder ${prefix}:`, err);
    return { error: err.message };
  }
}

export async function getPresignedUrl(path: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { 
      expiresIn: 900,
      signableHeaders: new Set(["content-type"])
    });
    
    return { success: true, url };
  } catch (err: any) {
    console.error("Error generating presigned URL:", err);
    return { error: err.message };
  }
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

export async function uploadToR2(formData: FormData) {
  const file = formData.get("file") as File;
  const path = formData.get("path") as string;

  if (!file) return { error: "No file provided" };
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    });

    await r2Client.send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${path}`;
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("R2 Upload error:", err);
    return { error: err.message || "Failed to upload to R2" };
  }
}

export async function deleteFileFromR2(url: string) {
  if (!url || !url.startsWith(R2_PUBLIC_URL)) {
    return { success: false, error: "Invalid URL or not an R2 file" };
  }

  try {
    const path = url.replace(`${R2_PUBLIC_URL}/`, "");
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
    });
    await r2Client.send(command);
    return { success: true };
  } catch (err: any) {
    console.error("R2 Delete error:", err);
    return { error: err.message || "Failed to delete from R2" };
  }
}
