import { getCurrentUser } from "@/lib/backend/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sesión no válida o expirada." }, { status: 401 });
  }
  // Los permisos internos no viajan al navegador; la interfaz solo necesita identidad y roles.
  const { permissions: _permissions, ...publicUser } = user;
  return NextResponse.json({ user: publicUser });
}
