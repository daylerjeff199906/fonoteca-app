"use server"

import { revalidatePath } from "next/cache"
import { fetchWithSession, getCurrentUser, type BackendUser } from "@/lib/backend/auth"
import { recordAudit } from "@/lib/backend/audit"
import { assignableRoles, canManageAccount, effectiveRole, normalizeRole, type RoleCode } from "@/lib/roles"

const API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1"

function apiUrl(path: string) {
  return new URL(path.replace(/^\//, ""), `${API_URL.replace(/\/$/, "")}/`).toString();
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const value = payload as { message?: unknown; error?: { message?: unknown } };
  return typeof value.error?.message === "string"
    ? value.error.message
    : typeof value.message === "string"
      ? value.message
      : fallback;
}

/** Códigos de rol de un usuario tal como los devuelve el backend. */
function roleCodesOf(user: any): string[] {
  const direct = user?.roles?.map((role: any) => (typeof role === "string" ? role : role?.code)).filter(Boolean)
  if (direct) return direct
  return user?.user_roles?.map((entry: any) => entry?.roles?.code).filter(Boolean) ?? []
}

type Authorized = { ok: true; actor: BackendUser; target?: { id: string; email?: string; roles: string[] } } | { ok: false; error: string }

/**
 * Autoriza una operación sobre cuentas con el rol de quien la pide. La interfaz oculta lo que no
 * corresponde, pero esta comprobación es la que cuenta: las acciones del servidor son invocables
 * directamente. La verificación definitiva sigue siendo del backend.
 */
async function authorize(targetId?: string): Promise<Authorized> {
  const actor = await getCurrentUser()
  if (!actor) return { ok: false, error: "Su sesión expiró. Inicie sesión nuevamente." }

  const deny = (error: string, target?: string) => {
    recordAudit({ action: "access.denied", actor: { id: actor.id, email: actor.email, roles: actor.roles }, target: target ? { id: target } : undefined, detail: error })
    return { ok: false as const, error }
  }

  if (!targetId) {
    return effectiveRole(actor.roles) && assignableRoles(actor.roles).length > 0
      ? { ok: true, actor }
      : deny("Su rol no permite administrar cuentas de usuario.")
  }

  const res = await fetchWithSession(apiUrl(`/users/${targetId}`))
  if (!res.ok) return { ok: false, error: "No se pudo verificar la cuenta seleccionada." }
  const data = await res.json().catch(() => null)
  const record = data?.data ?? data
  const roles = roleCodesOf(record)

  const check = canManageAccount({ actorId: actor.id, actorRoles: actor.roles, targetId, targetRoles: roles })
  if (!check.allowed) return deny(check.reason ?? "No tiene permiso para administrar esta cuenta.", targetId)
  return { ok: true, actor, target: { id: targetId, email: record?.email, roles } }
}

const who = (actor: BackendUser) => ({ id: actor.id, email: actor.email, roles: actor.roles })

export async function getSystemUsers(params?: { page?: number; limit?: number; search?: string }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await fetchWithSession(apiUrl(`/users${query}`))
    if (!res.ok) throw new Error("No se pudieron obtener los usuarios. Es posible que su rol no tenga permiso para consultarlos.")
    const data = await res.json()
    const records = Array.isArray(data) ? data : data.data || [];
    const meta = data.meta || { totalItems: records.length };
    return { success: true, data: records, meta }
  } catch (error: any) {
    return { success: false, error: error.message || "No se pudieron obtener los usuarios." }
  }
}

export async function getSystemUser(id: string) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}`))
    if (!res.ok) throw new Error("Error al obtener el usuario.")
    const data = await res.json()
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createSystemUser(data: { email: string; name: string; roles: string[] }) {
  try {
    const auth = await authorize()
    if (!auth.ok) return { success: false, error: auth.error }

    const allowed = assignableRoles(auth.actor.roles)
    const requested = data.roles.map(normalizeRole)
    if (requested.length === 0 || requested.some((role) => role === null || !allowed.includes(role))) {
      return { success: false, error: "Su rol no puede asignar el rol seleccionado." }
    }

    const res = await fetchWithSession(apiUrl("/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(errorMessage(payload, "Error al crear usuario."))

    recordAudit({ action: "user.create", actor: who(auth.actor), target: { id: String(payload?.id ?? payload?.data?.id ?? ""), email: data.email }, after: { roles: data.roles } })
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSystemUser(id: string, data: { email?: string; name?: string; roles?: string[] }) {
  try {
    const auth = await authorize(id)
    if (!auth.ok) return { success: false, error: auth.error }

    // Los roles solo se cambian con changeUserRole (confirmación y auditoría).
    if (data.roles) {
      const current = new Set(auth.target!.roles.map((code) => code.toUpperCase()))
      const same = data.roles.length === current.size && data.roles.every((code) => current.has(code.toUpperCase()))
      if (!same) return { success: false, error: "Los roles se cambian desde «Gestionar rol», con confirmación." }
    }

    const res = await fetchWithSession(apiUrl(`/users/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(errorMessage(payload, "Error al actualizar usuario."))

    recordAudit({ action: "user.update", actor: who(auth.actor), target: { id, email: data.email ?? auth.target!.email }, detail: "datos básicos" })
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSystemUser(id: string) {
  try {
    const auth = await authorize(id)
    if (!auth.ok) return { success: false, error: auth.error }

    const res = await fetchWithSession(apiUrl(`/users/${id}`), {
      method: "DELETE",
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(errorMessage(payload, "Error al eliminar usuario."))
    }

    recordAudit({ action: "user.delete", actor: who(auth.actor), target: { id, email: auth.target!.email }, before: { roles: auth.target!.roles } })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Deja a la persona con un único rol principal. Asigna el nuevo rol y luego retira los demás roles
 * jerárquicos que tuviera (los acumulados quedan redundantes). Los roles que este modelo no reconoce
 * no se tocan. Cada cambio queda auditado con el estado anterior y el nuevo.
 */
export async function changeUserRole(id: string, newRole: RoleCode) {
  try {
    const auth = await authorize(id)
    if (!auth.ok) return { success: false, error: auth.error }
    if (!assignableRoles(auth.actor.roles).includes(newRole)) {
      recordAudit({ action: "access.denied", actor: who(auth.actor), target: { id }, detail: `intento de asignar ${newRole}` })
      return { success: false, error: "Su rol no puede asignar el rol seleccionado." }
    }

    const before = auth.target!.roles
    const holdsNew = before.some((code) => normalizeRole(code) === newRole)
    const toRevoke = before.filter((code) => {
      const role = normalizeRole(code)
      return role !== null && role !== newRole
    })
    if (holdsNew && toRevoke.length === 0) return { success: true, unchanged: true }

    if (!holdsNew) {
      const res = await fetchWithSession(apiUrl(`/users/${id}/roles`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: [newRole] }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(errorMessage(payload, "Error al asignar el rol."))
    }
    if (toRevoke.length > 0) {
      const res = await fetchWithSession(apiUrl(`/users/${id}/roles`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: toRevoke }),
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) throw new Error(`Se asignó el nuevo rol pero no se pudieron retirar los anteriores: ${errorMessage(payload, "error del servidor")}`)
    }

    recordAudit({
      action: "user.roles.change",
      actor: who(auth.actor),
      target: { id, email: auth.target!.email },
      before: { roles: before, effective: effectiveRole(before) },
      after: { effective: newRole, assigned: holdsNew ? [] : [newRole], revoked: toRevoke },
    })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resetSystemPassword(id: string) {
  try {
    const auth = await authorize(id)
    if (!auth.ok) return { success: false, error: auth.error }

    const res = await fetchWithSession(apiUrl(`/users/${id}/reset-password`), {
      method: "POST",
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(errorMessage(payload, "Error al restablecer la contraseña."))

    recordAudit({ action: "user.password.reset", actor: who(auth.actor), target: { id, email: auth.target!.email } })
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function changeOwnPassword(data: { oldPassword: string; newPassword: string }) {
  try {
    const res = await fetchWithSession(apiUrl("/users/me/change-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(errorMessage(payload, "Error al cambiar contraseña."))

    return { success: true, message: payload.message }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
