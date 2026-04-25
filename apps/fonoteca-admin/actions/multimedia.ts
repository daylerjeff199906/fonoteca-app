"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { MultimediaInput, multimediaSchema } from "@/lib/validations/fonoteca";
import { Multimedia } from "@/types/fonoteca";
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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("multimedia")
    .select("*, occurrences(*, taxa(*))", { count: "exact" });

  if (occurrence_id) {
    query = query.eq("occurrence_id", occurrence_id);
  }

  if (type) {
    query = query.eq("type", type);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("error fetching multimedia:", error);
    return { data: [] as Multimedia[], count: 0, error: error.message };
  }

  const formattedData = (data || []).map((item: any) => ({
    ...item,
    occurrence: item.occurrences ? {
      ...item.occurrences,
      taxon: item.occurrences.taxa
    } : undefined
  })) as Multimedia[];

  return {
    data: formattedData,
    count: count || 0,
  };
}

export async function getMultimedia(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("multimedia")
    .select("*, occurrences(*, taxa(*))")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  const formattedData = {
    ...data,
    occurrence: data.occurrences ? {
      ...data.occurrences,
      taxon: data.occurrences.taxa
    } : undefined
  } as Multimedia;

  return { data: formattedData };
}

export async function createMultimedia(input: MultimediaInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = multimediaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("multimedia")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/multimedia");
  return { success: true, data: (data as any) as Multimedia };
}

export async function updateMultimedia(id: string, input: MultimediaInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = multimediaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("multimedia")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/multimedia");
  revalidatePath(`/dashboard/multimedia/${id}`);
  return { success: true, data: (data as any) as Multimedia };
}

export async function deleteMultimedia(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  // 1. Fetch item to get identifier (URL) 
  const { data: item } = await supabase
    .from("multimedia")
    .select("identifier")
    .eq("id", id)
    .single();

  // 2. Delete from database
  const { error } = await supabase
    .from("multimedia")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // 3. Delete from R2 bucket if url belongs to R2
  if (item && item.identifier) {
    try {
      if (item.identifier.startsWith(R2_PUBLIC_URL)) {
        const path = item.identifier.replace(`${R2_PUBLIC_URL}/`, "");
        const command = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: path,
        });
        await r2Client.send(command);
      }
    } catch (r2Err) {
      console.error("Failed to delete from R2:", r2Err);
      // We don't block the UI because DB was already successfully cleaned.
    }
  }

  revalidatePath("/dashboard/multimedia");
  return { success: true };
}

/**
 * Deletes all objects in an R2 bucket under a specific prefix.
 * Useful for "deleting a folder" in R2.
 */
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

/**
 * Generates a presigned URL for direct upload from the client to R2.
 * This allows monitoring upload progress on the client side.
 */
export async function getPresignedUrl(path: string, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: path,
      ContentType: contentType,
    });

    // Valid for 15 minutes. 
    // AWS SDK should handle the signing correctly, but let's be explicitly matching
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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  for (const update of updates) {
    await supabase
      .from("multimedia")
      .update({ order_index: update.order_index })
      .eq("id", update.id);
  }

  revalidatePath("/dashboard/multimedia");
  return { success: true };
}

export async function updateMultimediaSpectrogram(id: string, spectrogram_url: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("multimedia")
    .update({ spectrogram_url })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/multimedia");
  return { success: true };
}

export async function uploadToR2(formData: FormData) {
  const file = formData.get("file") as File;
  const path = formData.get("path") as string; // occurrences/occurrenceId/filename.ext

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
