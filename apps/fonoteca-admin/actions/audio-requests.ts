"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendRequestResolutionEmail } from "@/utils/email";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getR2Key = (url: string) => {
  if (url.startsWith(R2_PUBLIC_URL)) {
    return url.replace(`${R2_PUBLIC_URL}/`, "");
  }
  const parts = url.split('.r2.dev/');
  if (parts.length > 1) return parts[1];
  return url;
};

async function getPresignedDownloadUrl(url: string, expiresIn = 3600) {
  if (!url) return "";
  const key = getR2Key(url);
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"`,
    });
    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (err) {
    console.error("Error signing download url:", err);
    return url;
  }
}

export async function getAudioRequestsList({
  page = 1,
  limit = 10,
  status = "",
}: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("audio_requests")
    .select(`
      *,
      audio_request_items (
        multimedia (
          id,
          title,
          type,
          format,
          creator,
          identifier,
          tag,
          vocalization_type,
          duration_seconds,
          occurrences (
            id,
            taxa (
              id,
              scientificName
            )
          )
        )
      )
    `, { count: "exact" });

  if (status && status !== "all") {
    query = query.eq("request_status", status);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching audio requests:", error);
    return { data: [], count: 0, error: error.message };
  }

  // Format data to map multimedia items correctly
  const formattedData = (data || []).map((req: any) => {
    const items = (req.audio_request_items || [])
      .map((item: any) => {
        if (!item.multimedia) return null;
        return {
          ...item.multimedia,
          occurrence: item.multimedia.occurrences ? {
            ...item.multimedia.occurrences,
            taxon: item.multimedia.occurrences.taxa
          } : undefined
        };
      })
      .filter(Boolean);

    return {
      ...req,
      items
    };
  });

  return {
    data: formattedData,
    count: count || 0,
  };
}

export async function updateAudioRequestStatus(id: string, status: 'approved' | 'rejected') {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const updatePayload: Record<string, any> = {
    request_status: status,
    updated_at: new Date().toISOString()
  };

  if (status === 'approved') {
    // Ephemeral links are valid for 48 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    updatePayload.expires_at = expiresAt.toISOString();
  } else {
    updatePayload.expires_at = null;
  }

  const { data, error } = await supabase
    .from("audio_requests")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating audio request status:", error);
    return { error: error.message };
  }

  // Trigger resolution email in background/async
  try {
    // 1. Fetch details of the request items to generate presigned URLs and taxonomy details
    const { data: fullRequest } = await supabase
      .from("audio_requests")
      .select(`
        *,
        audio_request_items (
          multimedia (
            id,
            title,
            format,
            duration_seconds,
            vocalization_type,
            background_species,
            identifier,
            occurrences (
              id,
              taxa (
                id,
                scientificName,
                vernacularName,
                genus:genera (
                  name,
                  family:families (
                    name
                  )
                )
              )
            )
          )
        )
      `)
      .eq("id", id)
      .single();

    const rawItems = (fullRequest?.audio_request_items || [])
      .map((item: any) => item.multimedia)
      .filter(Boolean);

    const items = await Promise.all(
      rawItems.map(async (item: any) => {
        let downloadUrl = "";
        if (data.request_status === 'approved' && item.identifier) {
          // Generate a 48-hour presigned URL matching the request's lifetime
          downloadUrl = await getPresignedDownloadUrl(item.identifier, 172800);
        }
        const taxon = item.occurrences?.taxa;
        return {
          title: item.title,
          format: item.format,
          duration: item.duration_seconds,
          vocalizationType: item.vocalization_type,
          backgroundSpecies: item.background_species,
          occurrenceId: item.occurrences?.id || item.occurrence_id,
          scientificName: taxon?.scientificName,
          vernacularName: taxon?.vernacularName,
          genusName: taxon?.genus?.name,
          familyName: taxon?.genus?.family?.name,
          downloadUrl,
        };
      })
    );

    await sendRequestResolutionEmail({
      recipientEmail: data.requester_email,
      requesterName: data.requester_name || "Investigador",
      status: data.request_status as 'approved' | 'rejected',
      requestId: data.id,
      expiresAt: data.expires_at,
      items,
    });
  } catch (emailErr) {
    console.error("Failed to send resolution email notification:", emailErr);
  }

  revalidatePath("/dashboard/audio-requests");
  return { success: true, data };
}
