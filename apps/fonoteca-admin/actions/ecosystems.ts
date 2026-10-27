"use server"

import { revalidatePath } from "next/cache";
import { EcosystemInput, ecosystemSchema } from "@/lib/validations/fonoteca";
import { Ecosystem } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud, deactivateCrud, multipleDeleteCrud, getAllCrud } from "@/lib/backend/crud";

export async function getEcosystems({
  page = 1,
  limit = 10,
  search = "",
  region_id = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  region_id?: string;
}) {
  try {
    const params: Record<string, string | number | undefined> = { page, limit, search };
    if (region_id) params.region_id = region_id;
    
    const result = await getCrudPage<Ecosystem>("ecosystems", params);
    return { data: result.data, count: result.meta.totalItems };
  } catch (error) {
    console.error("error fetching ecosystems:", error);
    return { data: [] as Ecosystem[], count: 0, error: error instanceof Error ? error.message : "Error al cargar hábitats" };
  }
}

export async function getAllEcosystems({
  search = "",
  region_id = "",
}: {
  search?: string;
  region_id?: string;
} = {}) {
  try {
    const params: Record<string, string | number | undefined> = { search };
    if (region_id) params.region_id = region_id;
    
    const data = await getAllCrud<Ecosystem>("ecosystems", params);
    return { data };
  } catch (error) {
    return { data: [] as Ecosystem[], error: error instanceof Error ? error.message : "Error" };
  }
}

export async function getEcosystem(id: string) {
  try {
    const data = await getCrudItem<Ecosystem>("ecosystems", id);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cargar el hábitat" };
  }
}

export async function createEcosystem(input: EcosystemInput) {
  const parsed = ecosystemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Ecosystem>("ecosystems", "POST", parsed.data);
    revalidatePath("/dashboard/geography/ecosystems");
    revalidatePath("/dashboard/occurrences/create");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear el hábitat" };
  }
}

export async function updateEcosystem(id: string, input: EcosystemInput) {
  const parsed = ecosystemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Ecosystem>("ecosystems", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/geography/ecosystems");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar el hábitat" };
  }
}

export async function deleteEcosystem(id: string) {
  try {
    await mutateCrud("ecosystems", "DELETE", undefined, id);
    revalidatePath("/dashboard/geography/ecosystems");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar el hábitat" };
  }
}

export async function deactivateEcosystem(id: string) {
  try {
    await deactivateCrud("ecosystems", id);
    revalidatePath("/dashboard/geography/ecosystems");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al desactivar el hábitat" };
  }
}

export async function multipleDeleteEcosystems(ids: string[]) {
  try {
    await multipleDeleteCrud("ecosystems", ids);
    revalidatePath("/dashboard/geography/ecosystems");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar los hábitats" };
  }
}
