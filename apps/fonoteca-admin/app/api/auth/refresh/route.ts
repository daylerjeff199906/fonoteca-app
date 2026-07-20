import { refreshSession } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const accessToken = await refreshSession();
  return accessToken
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
}
