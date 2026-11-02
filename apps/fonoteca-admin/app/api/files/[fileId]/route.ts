import { NextRequest, NextResponse } from "next/server";
import { deleteMediaFile, getMediaFile, MediaServiceError } from "@/lib/media-service";
import { requireMediaWrite } from "@/lib/backend/media-access";
import { getCurrentUser } from "@/lib/backend/auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Estado del archivo (procesamiento y URLs de sus derivados). El panel lo consulta hasta que termina. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ detail: "Debe iniciar sesión para consultar archivos." }, { status: 401 });
  }

  try {
    const { fileId } = await params;
    if (!UUID.test(fileId)) return NextResponse.json({ detail: "Se requiere el UUID del archivo." }, { status: 400 });
    return NextResponse.json(await getMediaFile(fileId), { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Error al consultar el archivo" },
      { status: error instanceof MediaServiceError ? error.status : 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const denied = await requireMediaWrite();
  if (denied) return denied;

  try {
    const { fileId } = await params;
    if (!UUID.test(fileId)) return NextResponse.json({ detail: "Se requiere el UUID del archivo." }, { status: 400 });
    await deleteMediaFile(fileId);
    return NextResponse.json({ success: true, message: "Archivo eliminado correctamente" });
  } catch (error: any) {
    console.error("Error in /api/files/[fileId] DELETE proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al eliminar el archivo" },
      { status: error instanceof MediaServiceError ? error.status : 500 },
    );
  }
}
