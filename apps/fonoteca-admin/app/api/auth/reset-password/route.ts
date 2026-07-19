import { resetPassword } from "@/lib/backend/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ token: z.string().min(1), password: z.string().min(12).max(128) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "La contraseña debe tener entre 12 y 128 caracteres." }, { status: 400 });
  try {
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "No se pudo restablecer la contraseña." }, { status: 400 });
  }
}
