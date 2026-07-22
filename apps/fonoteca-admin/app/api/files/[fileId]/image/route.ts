import { NextRequest, NextResponse } from "next/server";
import { getFileImageVariant } from "@/lib/file-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);

    const w = searchParams.get("w") ? Number(searchParams.get("w")) : undefined;
    const h = searchParams.get("h") ? Number(searchParams.get("h")) : undefined;
    const fit = searchParams.get("fit") as 'inside' | 'cover' | undefined;
    const q = searchParams.get("q") ? Number(searchParams.get("q")) : undefined;
    const format = searchParams.get("format") as 'webp' | 'jpeg' | 'png' | undefined;

    const variant = await getFileImageVariant(fileId, { w, h, fit, q, format });
    return NextResponse.json(variant);
  } catch (error: any) {
    console.error("Error in /api/files/[fileId]/image GET proxy:", error);
    return NextResponse.json(
      { detail: error.message || "Error al generar variante de imagen" },
      { status: 500 }
    );
  }
}
