"use server";

import { clearSession } from "@/lib/backend/auth";
import { redirect } from "next/navigation";

export async function signout() {
  await clearSession();
  redirect("/login");
}
