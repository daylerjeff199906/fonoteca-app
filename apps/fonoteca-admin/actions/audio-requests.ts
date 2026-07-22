"use server";

import { revalidatePath } from "next/cache";
import { sendRequestResolutionEmail } from "@/utils/email";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCrudPage, getCrudItem, mutateCrud } from "@/lib/backend/crud";

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
  try {
    const params: Record<string, string | number | undefined> = { page, limit };
    if (status && status !== "all") {
      params.request_status = status;
    }

    const result = await getCrudPage<any>("audio-requests", params);
    const formattedData = (result.data || []).map((req: any) => {
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
      count: result.meta?.totalItems ?? formattedData.length,
    };
  } catch (error) {
    console.error("Error fetching audio requests:", error);
    return { data: [], count: 0, error: error instanceof Error ? error.message : "Error al obtener solicitudes" };
  }
}

export async function updateAudioRequestStatus(id: string, status: 'approved' | 'rejected') {
  try {
    const updatePayload: Record<string, any> = {
      request_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      updatePayload.expires_at = expiresAt.toISOString();
    } else {
      updatePayload.expires_at = null;
    }

    const data = await mutateCrud<any>("audio-requests", "PATCH", updatePayload, id);

    // Trigger resolution email in background/async
    try {
      let fullRequest: any = null;
      try {
        fullRequest = await getCrudItem<any>("audio-requests", id);
      } catch {
        fullRequest = data;
      }

      const rawItems = (fullRequest?.audio_request_items || [])
        .map((item: any) => item.multimedia)
        .filter(Boolean);

      const items = await Promise.all(
        rawItems.map(async (item: any) => {
          let downloadUrl = "";
          if (data.request_status === 'approved' && item.identifier) {
            downloadUrl = await getPresignedDownloadUrl(item.identifier, 172800);
          }
          const taxon = item.occurrences?.taxa || item.occurrence?.taxon;
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
  } catch (error) {
    console.error("Error updating audio request status:", error);
    return { error: error instanceof Error ? error.message : "Error al actualizar estado" };
  }
}
