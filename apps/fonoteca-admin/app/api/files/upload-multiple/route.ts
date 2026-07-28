import { NextRequest, NextResponse } from "next/server";
import { FileServiceError, uploadMultipleFilesToFileService } from "@/lib/file-service";

export async function POST(request: NextRequest) {
  try {
    // El servicio espera uno o más campos `files` en el mismo multipart.
    const result = await uploadMultipleFilesToFileService(await request.formData());
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/files/upload-multiple proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga múltiple de archivos" },
      { status: error instanceof FileServiceError ? error.status : 500 }
    );
  }
}
