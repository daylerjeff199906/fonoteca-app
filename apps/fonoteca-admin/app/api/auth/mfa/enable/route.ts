import { enableMfa } from "@/lib/backend/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "El código OTP es obligatorio." }, { status: 400 });
  }

  try {
    const result = await enableMfa(parsed.data.code);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo habilitar MFA." },
      { status: 400 }
    );
  }
}
