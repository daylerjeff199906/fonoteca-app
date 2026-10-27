import { setupMfa } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await setupMfa();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo iniciar el proceso MFA." },
      { status: 400 }
    );
  }
}
