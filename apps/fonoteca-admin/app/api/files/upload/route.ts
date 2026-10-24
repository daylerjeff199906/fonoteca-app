import { NextRequest, NextResponse } from "next/server";
import { MediaServiceError, uploadMediaFile } from "@/lib/media-service";
import { requireMediaWrite, validateUploadFiles } from "@/lib/backend/media-access";

/** Campos del formulario que el backend entiende. Cualquier otro se descarta. */
const FORWARDED_FIELDS = ["duplicate_policy", "metadata", "resource_type", "pending"] as const;

export async function POST(request: NextRequest) {
  const denied = await requireMediaWrite();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const invalid = await validateUploadFiles(formData, "file");
    if (invalid) return invalid;

    const file = formData.get("file") as File;
    const outgoing = new FormData();
    outgoing.append("file", file, file.name);
    for (const field of FORWARDED_FIELDS) {
      const value = formData.get(field);
      if (typeof value === "string") outgoing.append(field, value);
    }

    return NextResponse.json(await uploadMediaFile(outgoing), { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/files/upload proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga del archivo" },
      { status: error instanceof MediaServiceError ? error.status : 500 },
    );
  }
}
