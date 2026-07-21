import "server-only";

import { fetchWithSession } from "@/lib/backend/auth";

export interface PaginationMeta { page: number; limit: number; totalItems: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }
export interface PaginatedResponse<T> { data: T[]; meta: PaginationMeta }

function apiUrl(path: string, params: Record<string, string | number | undefined>) {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
  const url = new URL(path.replace(/^\//, ""), `${base.replace(/\/$/, "")}/`);
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
  return url;
}

async function crudRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetchWithSession(path, { ...init, headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers } });
  const payload = await response.json().catch(() => null) as T | { message?: unknown; error?: unknown; detail?: unknown } | null;
  if (!response.ok || !payload) {
    const body = payload && typeof payload === "object" ? payload as { message?: unknown; error?: unknown; detail?: unknown } : {};
    const nestedError = body.error && typeof body.error === "object" && "message" in body.error
      ? (body.error as { message?: unknown }).message
      : undefined;
    const candidate = body.message ?? body.detail ?? nestedError ?? body.error;
    const message = typeof candidate === "string" ? candidate : Array.isArray(candidate) ? candidate.filter((item): item is string => typeof item === "string").join(" ") : "";
    throw new Error(message || `El backend respondió HTTP ${response.status} al consultar la API.`);
  }
  return payload as T;
}

export async function getCrudPage<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<T>> {
  const payload = await crudRequest<PaginatedResponse<T>>(apiUrl(`/${endpoint}`, params).toString());
  if (!Array.isArray(payload.data) || !payload.meta) throw new Error("El backend devolvió una respuesta de paginación inválida.");
  return payload;
}

export async function getAllCrud<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T[]> {
  const limit = 100;
  const first = await getCrudPage<T>(endpoint, { ...params, page: 1, limit });
  const records = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await getCrudPage<T>(endpoint, { ...params, page, limit });
    records.push(...next.data);
  }
  return records;
}

export async function getCrudItem<T>(endpoint: string, id: string): Promise<T> {
  const payload = await crudRequest<T | { data: T }>(apiUrl(`/${endpoint}/${id}`, {}).toString());
  return typeof payload === "object" && payload !== null && "data" in payload ? payload.data : payload as T;
}

export async function mutateCrud<T>(endpoint: string, method: "POST" | "PATCH" | "DELETE", input?: unknown, id?: string): Promise<T> {
  const path = apiUrl(`/${endpoint}${id ? `/${id}` : ""}`, {}).toString();
  const payload = await crudRequest<T | { data: T }>(path, { method, ...(input !== undefined ? { body: JSON.stringify(input) } : {}) });
  return typeof payload === "object" && payload !== null && "data" in payload ? payload.data : payload as T;
}

export async function deactivateCrud(endpoint: string, id: string): Promise<boolean> {
  const path = apiUrl(`/${endpoint}/${id}/deactivate`, {}).toString();
  await crudRequest(path, { method: "PATCH" });
  return true;
}

export async function multipleDeleteCrud(endpoint: string, ids: string[]): Promise<boolean> {
  const path = apiUrl(`/${endpoint}/multiple-delete`, {}).toString();
  await crudRequest(path, { method: "POST", body: JSON.stringify({ ids }) });
  return true;
}
