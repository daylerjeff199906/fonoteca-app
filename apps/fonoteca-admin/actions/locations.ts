"use server"

import { revalidatePath } from "next/cache";
import { LocationInput, locationSchema } from "@/lib/validations/fonoteca";
import { Location } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud, deactivateCrud, multipleDeleteCrud, getAllCrud } from "@/lib/backend/crud";

export async function getLocations({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await getCrudPage<Location>("locations", { page, limit, search });
    return { data: result.data, count: result.meta.totalItems };
  } catch (error) {
    console.error("error fetching locations:", error);
    return { data: [] as Location[], count: 0, error: error instanceof Error ? error.message : "Error al cargar ubicaciones" };
  }
}

export async function getLocation(id: string) {
  try {
    const data = await getCrudItem<Location>("locations", id);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cargar la ubicación" };
  }
}

export async function getUbigeoDepartments() {
  try {
    const data = await getAllCrud<any>("ubigeo-departments");
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cargar departamentos" };
  }
}

export async function getUbigeoProvinces(departmentId?: string) {
  try {
    const params: Record<string, string> = {};
    if (departmentId) params.department_id = departmentId;
    const data = await getAllCrud<any>("ubigeo-provinces", params);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cargar provincias" };
  }
}

export async function getUbigeoDistricts(provinceId?: string) {
  try {
    const params: Record<string, string> = {};
    if (provinceId) params.province_id = provinceId;
    const data = await getAllCrud<any>("ubigeo-districts", params);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al cargar distritos" };
  }
}

export async function createLocation(input: LocationInput) {
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Location>("locations", "POST", parsed.data);
    revalidatePath("/dashboard/locations");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear la ubicación" };
  }
}

export async function updateLocation(id: string, input: LocationInput) {
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Location>("locations", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/locations");
    revalidatePath(`/dashboard/locations/${id}`);
    revalidatePath(`/dashboard/locations/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar la ubicación" };
  }
}

export async function deleteLocation(id: string) {
  try {
    await mutateCrud("locations", "DELETE", undefined, id);
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar la ubicación" };
  }
}

export async function deactivateLocation(id: string) {
  try {
    await deactivateCrud("locations", id);
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al desactivar la ubicación" };
  }
}

export async function multipleDeleteLocations(ids: string[]) {
  try {
    await multipleDeleteCrud("locations", ids);
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar las ubicaciones" };
  }
}
