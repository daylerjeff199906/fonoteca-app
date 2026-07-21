import "server-only";

import { fetchWithSession } from "@/lib/backend/auth";

export interface PaginationMeta { page: number; limit: number; totalItems: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }
export interface PaginatedResponse<T> { data: T[]; meta: PaginationMeta }
type TaxonomyEntity = "classes" | "orders" | "families" | "genera" | "taxa";

function apiUrl(path: string, params: Record<string, string | number | undefined>) {
  const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";
  const url = new URL(path.replace(/^\//, ""), `${base.replace(/\/$/, "")}/`);
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
  return url;
}

function normalizeTaxonomyItem<T>(entity: TaxonomyEntity, item: T): T {
  if (!item || typeof item !== "object") return item;
  const record = item as Record<string, unknown>;
  const parent = (record.parent ?? record.class ?? record.order ?? record.family ?? record.genus) as Record<string, unknown> | undefined;

  switch (entity) {
    case "orders": {
      const classObj = (record.class_obj ?? record.class ?? (typeof parent === "object" ? parent : undefined)) as Record<string, unknown> | undefined;
      const classId = (record.class_id ?? record.classId ?? classObj?.id) as string | undefined;
      return {
        ...record,
        class_id: classId,
        class_obj: classObj,
        parent: typeof parent === "object" ? parent : classObj,
      } as T;
    }
    case "families": {
      const orderObj = (record.order_obj ?? record.order ?? (typeof parent === "object" ? parent : undefined)) as Record<string, unknown> | undefined;
      const orderId = (record.order_id ?? record.orderId ?? orderObj?.id) as string | undefined;
      return {
        ...record,
        order_id: orderId,
        order_obj: orderObj,
        parent: typeof parent === "object" ? parent : orderObj,
      } as T;
    }
    case "genera": {
      const familyObj = (record.family ?? record.family_obj ?? (typeof parent === "object" ? parent : undefined)) as Record<string, unknown> | undefined;
      const familyId = (record.family_id ?? record.familyId ?? familyObj?.id) as string | undefined;
      return {
        ...record,
        family_id: familyId,
        family: familyObj,
        parent: typeof parent === "object" ? parent : familyObj,
      } as T;
    }
    case "taxa": {
      const genusObj = (record.genus ?? record.genus_obj ?? (typeof parent === "object" ? parent : undefined)) as Record<string, unknown> | undefined;
      const genusId = (record.genus_id ?? record.genusId ?? genusObj?.id) as string | undefined;
      return {
        ...record,
        genus_id: genusId,
        genus: genusObj,
        parent: typeof parent === "object" ? parent : genusObj,
      } as T;
    }
    default:
      return item;
  }
}

async function taxonomyRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetchWithSession(path, { ...init, headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers } });
  const payload = await response.json().catch(() => null) as T | { message?: unknown; error?: unknown; detail?: unknown } | null;
  if (!response.ok || !payload) {
    const body = payload && typeof payload === "object" ? payload as { message?: unknown; error?: unknown; detail?: unknown } : {};
    const nestedError = body.error && typeof body.error === "object" && "message" in body.error
      ? (body.error as { message?: unknown }).message
      : undefined;
    const candidate = body.message ?? body.detail ?? nestedError ?? body.error;
    const message = typeof candidate === "string" ? candidate : Array.isArray(candidate) ? candidate.filter((item): item is string => typeof item === "string").join(" ") : "";
    throw new Error(message || `El backend respondió HTTP ${response.status} al consultar taxonomía.`);
  }
  return payload as T;
}

export async function getTaxonomyPage<T>(entity: TaxonomyEntity, params: Record<string, string | number | undefined> = {}): Promise<PaginatedResponse<T>> {
  const payload = await taxonomyRequest<PaginatedResponse<T>>(apiUrl(`/taxonomy/${entity}`, params).toString());
  if (!Array.isArray(payload.data) || !payload.meta) throw new Error("El backend devolvió una respuesta de paginación inválida.");
  return { ...payload, data: payload.data.map((item) => normalizeTaxonomyItem(entity, item)) };
}

export async function getAllTaxonomy<T>(entity: TaxonomyEntity, params: Record<string, string | number | undefined> = {}): Promise<T[]> {
  const limit = 100;
  const first = await getTaxonomyPage<T>(entity, { ...params, page: 1, limit });
  const records = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page += 1) {
    const next = await getTaxonomyPage<T>(entity, { ...params, page, limit });
    records.push(...next.data);
  }
  return records;
}

export async function getTaxonomyItem<T>(entity: TaxonomyEntity, id: string): Promise<T> {
  const payload = await taxonomyRequest<T | { data: T }>(apiUrl(`/taxonomy/${entity}/${id}`, {}).toString());
  const item = typeof payload === "object" && payload !== null && "data" in payload ? payload.data : payload;
  return normalizeTaxonomyItem(entity, item);
}

export async function mutateTaxonomy<T>(entity: TaxonomyEntity, method: "POST" | "PATCH" | "DELETE", input?: unknown, id?: string): Promise<T> {
  const path = apiUrl(`/taxonomy/${entity}${id ? `/${id}` : ""}`, {}).toString();
  const payload = await taxonomyRequest<T | { data: T }>(path, { method, ...(input !== undefined ? { body: JSON.stringify(input) } : {}) });
  return typeof payload === "object" && payload !== null && "data" in payload ? payload.data : payload;
}
