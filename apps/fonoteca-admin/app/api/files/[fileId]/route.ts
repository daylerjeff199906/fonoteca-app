import { NextRequest, NextResponse } from "next/server";
import { deleteFileFromFileService } from "@/lib/file-service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    await deleteFileFromFileService(fileId);
    return NextResponse.json({ success: true, message: "Archivo eliminado correctamente" });
  } catch (error: any) {
    console.error("Error in /api/files/[fileId] DELETE proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al eliminar el archivo" },
      { status: 500 }
    );
  }
}
