"use server";

import {
  clearSession,
  enableMfa,
  logoutAll,
  setupMfa,
  verifyMfaLogin,
} from "@/lib/backend/auth";
import { redirect } from "next/navigation";

export async function signout() {
  await clearSession();
  redirect("/login");
}

export async function signoutAll() {
  await logoutAll();
  redirect("/login");
}

export async function verifyMfaAction(mfaToken: string, code: string) {
  try {
    const result = await verifyMfaLogin(mfaToken, code);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al verificar MFA." };
  }
}

export async function setupMfaAction() {
  try {
    const data = await setupMfa();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al iniciar MFA." };
  }
}

export async function enableMfaAction(code: string) {
  try {
    const data = await enableMfa(code);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al habilitar MFA." };
  }
}
