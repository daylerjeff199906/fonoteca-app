import { requestPasswordReset } from "@/lib/backend/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });
const message = "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.";

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Ingresa un correo válido." }, { status: 400 });
  await requestPasswordReset(parsed.data.email).catch(() => undefined);
  // Respuesta uniforme: evita enumerar cuentas existentes.
  return NextResponse.json({ message });
}
