import { NextRequest, NextResponse } from "next/server";
import { uploadMultipleFilesToFileService } from "@/lib/file-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadMultipleFilesToFileService(formData);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/files/upload-multiple proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga múltiple de archivos" },
      { status: 500 }
    );
  }
}
