import { createSession, verifyMfaLogin } from "@/lib/backend/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  mfaToken: z.string().min(1),
  code: z.string().min(1),
  remember: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "El token MFA y el código OTP son obligatorios." }, { status: 400 });
  }

  try {
    const result = await verifyMfaLogin(parsed.data.mfaToken, parsed.data.code);
    if (result.token && result.refreshToken) {
      await createSession(result.token, result.refreshToken, parsed.data.remember === true);
    }
    return NextResponse.json({ user: result.user });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo verificar el código MFA." },
      { status: 401 }
    );
  }
}
