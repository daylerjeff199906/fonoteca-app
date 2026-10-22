import { NextRequest, NextResponse } from "next/server";
import { FileServiceError, uploadFileToFileService } from "@/lib/file-service";
import { requireMediaWrite, validateUploadFiles } from "@/lib/backend/media-access";

export async function POST(request: NextRequest) {
  const denied = await requireMediaWrite();
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const invalid = await validateUploadFiles(formData, "file");
    if (invalid) return invalid;

    // El multipart se reenvía intacto; el servicio espera el campo `file`.
    const result = await uploadFileToFileService(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/files/upload proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga del archivo" },
      { status: error instanceof FileServiceError ? error.status : 500 }
    );
  }
}
