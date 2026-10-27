"use server"

import { revalidatePath } from "next/cache";
import { NaturalRegionInput, naturalRegionSchema } from "@/lib/validations/fonoteca";
import { NaturalRegion } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud, deactivateCrud, multipleDeleteCrud, getAllCrud } from "@/lib/backend/crud";

export async function getNaturalRegions({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await getCrudPage<NaturalRegion>("natural-regions", { page, limit, search });
    return { data: result.data, count: result.meta.totalItems };
  } catch (error) {
    console.error("error fetching natural regions:", error);
    return { data: [] as NaturalRegion[], count: 0, error: error instanceof Error ? error.message : "Error al cargar regiones naturales" };
  }
}

export async function getAllNaturalRegions({
  search = "",
}: {
  search?: string;
} = {}) {
  try {
    const data = await getAllCrud<NaturalRegion>("natural-regions", { search });
    return { data };
  } catch (error) {
    return { data: [] as NaturalRegion[], error: error instanceof Error ? error.message : "Error" };
  }
}

export async function getNaturalRegion(id: string) {
  try {
    const data = await getCrudItem<NaturalRegion>("natural-regions", id);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cargar la región natural" };
  }
}

export async function createNaturalRegion(input: NaturalRegionInput) {
  const parsed = naturalRegionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<NaturalRegion>("natural-regions", "POST", parsed.data);
    revalidatePath("/dashboard/geography/natural-regions");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear la región natural" };
  }
}

export async function updateNaturalRegion(id: string, input: NaturalRegionInput) {
  const parsed = naturalRegionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<NaturalRegion>("natural-regions", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/geography/natural-regions");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar la región natural" };
  }
}

export async function deleteNaturalRegion(id: string) {
  try {
    await mutateCrud("natural-regions", "DELETE", undefined, id);
    revalidatePath("/dashboard/geography/natural-regions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar la región natural" };
  }
}

export async function deactivateNaturalRegion(id: string) {
  try {
    await deactivateCrud("natural-regions", id);
    revalidatePath("/dashboard/geography/natural-regions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al desactivar la región natural" };
  }
}

export async function multipleDeleteNaturalRegions(ids: string[]) {
  try {
    await multipleDeleteCrud("natural-regions", ids);
    revalidatePath("/dashboard/geography/natural-regions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar las regiones naturales" };
  }
}
