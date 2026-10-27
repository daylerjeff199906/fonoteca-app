"use server";

import { revalidatePath } from "next/cache";
import { Collection } from "@/types/fonoteca";
import { CollectionInput } from "@/lib/validations/fonoteca";
import { getCrudPage, getCrudItem, mutateCrud, deactivateCrud, multipleDeleteCrud, getAllCrud } from "@/lib/backend/crud";

export async function getCollections(filters?: { institution_id?: string; limit?: number }) {
  try {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.institution_id) params.institution_id = filters.institution_id;
    if (filters?.limit) params.limit = filters.limit;

    const data = await getAllCrud<Collection>("collections", params);
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { data: [], error: error instanceof Error ? error.message : "Error al cargar colecciones" };
  }
}

export async function getCollection(id: string) {
  try {
    const data = await getCrudItem<Collection>("collections", id);
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching collection:", error);
    return { data: null, error: error instanceof Error ? error.message : "No se pudo cargar la colección" };
  }
}

export async function createCollection(data: CollectionInput) {
  try {
    const newCollection = await mutateCrud<Collection>("collections", "POST", data);
    revalidatePath("/dashboard/occurrences");
    return { success: true, data: newCollection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al crear la colección" };
  }
}

export async function updateCollection(id: string, data: Partial<CollectionInput>) {
  try {
    const updatedRecord = await mutateCrud<Collection>("collections", "PATCH", data, id);
    revalidatePath("/dashboard/occurrences");
    return { success: true, data: updatedRecord };
  } catch (error) {
    console.error("Error updating collection:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al actualizar la colección" };
  }
}

export async function deleteCollection(id: string) {
  try {
    await mutateCrud("collections", "DELETE", undefined, id);
    revalidatePath("/dashboard/occurrences");
    return { success: true };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar la colección" };
  }
}
