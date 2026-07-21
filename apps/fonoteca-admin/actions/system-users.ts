"use server"

import { revalidatePath } from "next/cache"
import { fetchWithSession } from "@/lib/backend/auth"
import { getCrudPage } from "@/lib/backend/crud"

const API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1"

function apiUrl(path: string) {
  return new URL(path.replace(/^\//, ""), `${API_URL.replace(/\/$/, "")}/`).toString();
}

export async function getSystemUsers(params?: { page?: number; limit?: number; search?: string }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await fetchWithSession(apiUrl(`/users${query}`))
    if (!res.ok) throw new Error("Error al obtener usuarios.")
    const data = await res.json()
    // Si la respuesta es un paginador pero nosotros esperamos array o viceversa, lo adaptamos.
    // Como el error era "El backend devolvió una respuesta de paginación inválida", significa que devolvió un array.
    const records = Array.isArray(data) ? data : data.data || [];
    const meta = data.meta || { totalItems: records.length };
    return { success: true, data: records, meta }
  } catch (error: any) {
    return { success: false, error: error.message || "Error al obtener usuarios." }
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

export async function createSystemUser(data: { email: string; name: string; role?: string }) {
  try {
    const res = await fetchWithSession(apiUrl("/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.message || "Error al crear usuario.")
    
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateSystemUser(id: string, data: { email?: string; name?: string; role?: string }) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.message || "Error al actualizar usuario.")
    
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSystemUser(id: string) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}`), {
      method: "DELETE",
    })
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      throw new Error(payload.message || "Error al eliminar usuario.")
    }
    
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function assignSystemRoles(id: string, roles: string[]) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}/roles`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.message || "Error al asignar roles.")
    
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function revokeSystemRoles(id: string, roles: string[]) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}/roles`), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roles }),
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.message || "Error al revocar roles.")
    
    revalidatePath("/dashboard/users")
    return { success: true, data: payload }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resetSystemPassword(id: string) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${id}/reset-password`), {
      method: "POST",
    })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.message || "Error al resetear contraseña.")
    
    return { success: true, message: payload.message }
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
    if (!res.ok) throw new Error(payload.message || "Error al cambiar contraseña.")
    
    return { success: true, message: payload.message }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
