import { NextRequest, NextResponse } from "next/server";
import { sendRequestConfirmationEmail } from "@/utils/email";
import { getCrudItem } from "@/lib/backend/crud";

function corsResponse(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json();

    if (!requestId) {
      return corsResponse({ error: "Missing requestId parameter" }, 400);
    }

    let request: any = null;
    try {
      request = await getCrudItem<any>("audio-requests", requestId);
    } catch (err) {
      console.error("Error fetching request details for confirmation email:", err);
      return corsResponse({ error: "Request not found" }, 404);
    }

    if (!request) {
      return corsResponse({ error: "Request not found" }, 404);
    }

    const items = (request.audio_request_items || [])
      .map((item: any) => {
        if (!item.multimedia) return null;
        const media = item.multimedia;
        const occurrence = media.occurrences || media.occurrence;
        const taxon = occurrence?.taxa || occurrence?.taxon;
        
        return {
          title: media.title,
          format: media.format,
          duration: media.duration_seconds,
          vocalizationType: media.vocalization_type,
          backgroundSpecies: media.background_species,
          occurrenceId: occurrence?.id || media.occurrence_id,
          scientificName: taxon?.scientificName,
          vernacularName: taxon?.vernacularName,
          genusName: taxon?.genus?.name,
          familyName: taxon?.genus?.family?.name,
        };
      })
      .filter(Boolean);

    await sendRequestConfirmationEmail({
      recipientEmail: request.requester_email,
      requesterName: request.requester_name || "Investigador",
      institution: request.institution || "No especificada",
      rationale: request.observation_rationale || "Investigación",
      requestId: request.id,
      createdAt: request.created_at || new Date().toISOString(),
      items,
    });

    return corsResponse({ success: true, message: "Confirmation email sent" });
  } catch (error: any) {
    console.error("Error sending request confirmation email:", error);
    return corsResponse({ error: error.message || "Internal server error" }, 500);
  }
}
