import { createSession, login } from "@/lib/backend/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(1), remember: z.boolean().optional() });

export async function POST(request: Request) {
  const parsed = credentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Correo y contraseña son obligatorios." }, { status: 400 });
  try {
    const result = await login(parsed.data.email, parsed.data.password);
    await createSession(result.token, parsed.data.remember === true);
    return NextResponse.json({ user: result.user });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "No se pudo iniciar sesión." }, { status: 401 });
  }
}
