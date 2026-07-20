import { signup } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Datos de registro inválidos." }, { status: 400 });
  }

  try {
    const result = await signup(body as Record<string, unknown>);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo registrar el usuario." },
      { status: 400 }
    );
  }
}
