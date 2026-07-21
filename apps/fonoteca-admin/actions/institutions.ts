"use server"

import { revalidatePath } from "next/cache";
import { InstitutionInput, institutionSchema } from "@/lib/validations/fonoteca";
import { Institution } from "@/types/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud, deactivateCrud, multipleDeleteCrud, getAllCrud } from "@/lib/backend/crud";

export async function getInstitutions({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await getCrudPage<Institution>("institutions", { page, limit, search });
    return { data: result.data, count: result.meta.totalItems };
  } catch (error) {
    console.error("error fetching institutions:", error);
    return { data: [] as Institution[], count: 0, error: error instanceof Error ? error.message : "Error al cargar instituciones" };
  }
}

export async function getAllInstitutions({
  search = "",
}: {
  search?: string;
} = {}) {
  try {
    const data = await getAllCrud<Institution>("institutions", { search });
    return { data };
  } catch (error) {
    return { data: [] as Institution[], error: error instanceof Error ? error.message : "Error" };
  }
}

export async function getInstitution(id: string) {
  try {
    const data = await getCrudItem<Institution>("institutions", id);
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo cargar la institución" };
  }
}

export async function createInstitution(input: InstitutionInput) {
  const parsed = institutionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Institution>("institutions", "POST", parsed.data);
    revalidatePath("/dashboard/geography/institutions");
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al crear la institución" };
  }
}

export async function updateInstitution(id: string, input: InstitutionInput) {
  const parsed = institutionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<Institution>("institutions", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/geography/institutions");
    revalidatePath(`/dashboard/geography/institutions/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al actualizar la institución" };
  }
}

export async function deleteInstitution(id: string) {
  try {
    await mutateCrud("institutions", "DELETE", undefined, id);
    revalidatePath("/dashboard/geography/institutions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar la institución" };
  }
}

export async function deactivateInstitution(id: string) {
  try {
    await deactivateCrud("institutions", id);
    revalidatePath("/dashboard/geography/institutions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al desactivar la institución" };
  }
}

export async function multipleDeleteInstitutions(ids: string[]) {
  try {
    await multipleDeleteCrud("institutions", ids);
    revalidatePath("/dashboard/geography/institutions");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al eliminar las instituciones" };
  }
}
