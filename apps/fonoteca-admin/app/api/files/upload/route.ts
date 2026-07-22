import { NextRequest, NextResponse } from "next/server";
import { uploadFileToFileService } from "@/lib/file-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await uploadFileToFileService(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error in /api/files/upload proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al procesar la carga del archivo" },
      { status: 500 }
    );
  }
}
