import { NextRequest, NextResponse } from "next/server";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { sendRequestConfirmationEmail } from "@/utils/email";

// CORS Response Helper
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

// Preflight CORS Handler
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

    const cookieStore = await cookies();
    const supabase = await createFonotecaServer(cookieStore);

    // Fetch the request details with related items and their scientific names
    const { data: request, error } = await supabase
      .from("audio_requests")
      .select(`
        *,
        audio_request_items (
          multimedia (
            title,
            format,
            duration_seconds,
            vocalization_type,
            background_species,
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
      .eq("id", requestId)
      .single();

    if (error || !request) {
      console.error("Error fetching request details for confirmation email:", error);
      return corsResponse({ error: "Request not found" }, 404);
    }

    // Format the items list with complete details
    const items = (request.audio_request_items || [])
      .map((item: any) => {
        if (!item.multimedia) return null;
        const media = item.multimedia;
        const occurrence = media.occurrences;
        const taxon = occurrence?.taxa;
        
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

    // Trigger the confirmation and administrator notification email
    await sendRequestConfirmationEmail({
      recipientEmail: request.requester_email,
      requesterName: request.requester_name || "Investigador",
      institution: request.institution || "N/A",
      rationale: request.observation_rationale,
      items,
    });

    return corsResponse({ success: true });
  } catch (err: any) {
    console.error("API Error in audio-requests/created endpoint:", err);
    return corsResponse({ error: err.message || "Internal server error" }, 500);
  }
}
