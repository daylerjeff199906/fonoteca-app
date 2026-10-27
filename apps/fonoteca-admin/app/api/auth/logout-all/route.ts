import { logoutAll } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await logoutAll();
  return NextResponse.json({ ok: true, message: "Todas las sesiones han sido cerradas." });
}
