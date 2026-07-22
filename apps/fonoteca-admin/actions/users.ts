"use server";

import { getCrudPage } from "@/lib/backend/crud";
import { fetchWithSession } from "@/lib/backend/auth";
import { revalidatePath } from "next/cache";

const FONOTECA_MODULE_ID = "b799e97c-85cd-4073-ab96-583e13750899";
const API_URL = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";

function apiUrl(path: string) {
  return new URL(path.replace(/^\//, ""), `${API_URL.replace(/\/$/, "")}/`).toString();
}

export async function getUsers({ 
  page = 1, 
  limit = 10, 
  search = "" 
}: { 
  page?: number, 
  limit?: number, 
  search?: string 
}) {
  try {
    const result = await getCrudPage<any>("users", { page, limit, search });
    const formattedData = (result.data || []).map(u => ({
      id: u.id,
      first_name: u.first_name || u.name?.split(" ")[0] || "",
      last_name: u.last_name || u.name?.split(" ").slice(1).join(" ") || "",
      email: u.email,
      avatar_url: u.avatar_url || null,
      user_roles: u.roles || u.user_roles || []
    }));

    return { 
      data: formattedData, 
      count: result.meta?.totalItems ?? formattedData.length,
      moduleId: FONOTECA_MODULE_ID,
      success: true 
    };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { data: [], count: 0, success: false, error: error.message };
  }
}

export async function getAvailableRoles() {
  try {
    const res = await fetchWithSession(apiUrl("/roles"));
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: Array.isArray(data) ? data : data.data || [] };
    }
    return { 
      success: true, 
      data: [
        { id: "admin", name: "Administrador", description: "Acceso total" },
        { id: "editor", name: "Editor", description: "Edición de datos" },
        { id: "viewer", name: "Lector", description: "Solo lectura" }
      ] 
    };
  } catch {
    return { 
      success: true, 
      data: [
        { id: "admin", name: "Administrador", description: "Acceso total" },
        { id: "editor", name: "Editor", description: "Edición de datos" },
        { id: "viewer", name: "Lector", description: "Solo lectura" }
      ] 
    };
  }
}

export async function assignUserRole(userId: string, roleId: string, _moduleId: string) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${userId}/roles`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al asignar rol");
    }
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeUserRole(userId: string, roleId: string, _moduleId: string) {
  try {
    const res = await fetchWithSession(apiUrl(`/users/${userId}/roles/${roleId}`), {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al remover rol");
    }
    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchProfiles(search: string = "") {
  try {
    const result = await getCrudPage<any>("users", { page: 1, limit: 20, search });
    const formattedData = (result.data || []).map((u: any) => ({
      id: u.id,
      first_name: u.first_name || u.name?.split(" ")[0] || u.email?.split("@")[0] || "",
      last_name: u.last_name || (u.name ? u.name.split(" ").slice(1).join(" ") : ""),
      email: u.email || "",
      avatar_url: u.avatar_url || null,
    }));

    return { data: formattedData, success: true };
  } catch (error: any) {
    console.error("Error searching profiles:", error);
    return { data: [], success: false, error: error.message };
  }
}

