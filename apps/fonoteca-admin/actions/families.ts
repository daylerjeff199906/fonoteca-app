"use server"

import { revalidatePath } from "next/cache";
import { FamilyInput, familySchema } from "@/lib/validations/fonoteca";
import { Family } from "@/types/fonoteca";
import { getTaxonomyItem, getTaxonomyPage, mutateTaxonomy } from "@/lib/backend/taxonomy";

export async function getFamiliesPaginated({
  page = 1,
  limit = 10,
  search = "",
  order_id = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  order_id?: string;
}) {
  try { const result = await getTaxonomyPage<Family>("families", { page, limit, search, parentId: order_id }); return { data: result.data, count: result.meta.totalItems }; }
  catch (error) { return { data: [] as Family[], count: 0, error: error instanceof Error ? error.message : "No se pudieron cargar las familias." }; }
}

export async function getFamily(id: string) {
  try { return { data: await getTaxonomyItem<Family>("families", id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo cargar la familia." }; }
}

export async function createFamily(input: FamilyInput) {
  const parsed = familySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/families");
  try { return { success: true, data: await mutateTaxonomy<Family>("families", "POST", parsed.data) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo crear la familia." }; }
}

export async function updateFamily(id: string, input: FamilyInput) {
  const parsed = familySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/families");
  revalidatePath(`/dashboard/taxa/families/${id}`);
  try { return { success: true, data: await mutateTaxonomy<Family>("families", "PATCH", parsed.data, id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo actualizar la familia." }; }
}

export async function deleteFamily(id: string) {
  revalidatePath("/dashboard/taxa/families");
  try { await mutateTaxonomy("families", "DELETE", undefined, id); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo eliminar la familia." }; }
}
