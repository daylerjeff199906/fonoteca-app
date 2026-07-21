import { getCurrentUser } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sesión no válida o expirada." }, { status: 401 });
  }
  return NextResponse.json({ user });
}
