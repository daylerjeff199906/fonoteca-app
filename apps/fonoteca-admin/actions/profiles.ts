"use server";

import { fetchWithSession } from "@/lib/backend/auth";
import { getCrudPage } from "@/lib/backend/crud";

export async function getProfiles() {
  try {
    const result = await getCrudPage<any>("users", { page: 1, limit: 100 });
    const formattedData = (result.data || []).map((u: any) => ({
      id: u.id,
      first_name: u.first_name || u.name?.split(" ")[0] || "",
      last_name: u.last_name || u.name?.split(" ").slice(1).join(" ") || "",
    }));

    return { data: formattedData };
  } catch (error) {
    console.error("error fetching profiles:", error);
    return { data: [], error: error instanceof Error ? error.message : "Error al cargar perfiles" };
  }
}

export async function getCurrentProfile() {
  try {
    const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
    const res = await fetchWithSession(`${base.replace(/\/$/, "")}/auth/me`);
    if (!res.ok) return { error: "No user found" };
    const user = await res.json();
    return {
      data: {
        id: user.id,
        first_name: user.first_name || user.name?.split(" ")[0] || "",
        last_name: user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al obtener perfil actual" };
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

