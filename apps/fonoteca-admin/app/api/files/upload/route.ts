import { NextRequest, NextResponse } from "next/server";
import { FileServiceError, uploadFileToFileService } from "@/lib/file-service";

export async function POST(request: NextRequest) {
  try {
    // El multipart se reenvía intacto; el servicio espera el campo `file`.
    const result = await uploadFileToFileService(await request.formData());
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/files/upload proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga del archivo" },
      { status: error instanceof FileServiceError ? error.status : 500 }
    );
  }
}
