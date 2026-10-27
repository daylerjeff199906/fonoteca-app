"use server"

import { revalidatePath } from "next/cache";
import { GenusInput, genusSchema } from "@/lib/validations/fonoteca";
import { Genus } from "@/types/fonoteca";
import { getTaxonomyItem, getTaxonomyPage, mutateTaxonomy } from "@/lib/backend/taxonomy";

export async function getGeneraPaginated({
  page = 1,
  limit = 10,
  search = "",
  family_id = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  family_id?: string;
}) {
  try { const result = await getTaxonomyPage<Genus>("genera", { page, limit, search, parentId: family_id }); return { data: result.data, count: result.meta.totalItems }; }
  catch (error) { return { data: [] as Genus[], count: 0, error: error instanceof Error ? error.message : "No se pudieron cargar los géneros." }; }
}

export async function getGenus(id: string) {
  try { return { data: await getTaxonomyItem<Genus>("genera", id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo cargar el género." }; }
}

export async function createGenus(input: GenusInput) {
  const parsed = genusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/genera");
  try { return { success: true, data: await mutateTaxonomy<Genus>("genera", "POST", parsed.data) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo crear el género." }; }
}

export async function updateGenus(id: string, input: GenusInput) {
  const parsed = genusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/genera");
  revalidatePath(`/dashboard/taxa/genera/${id}`);
  try { return { success: true, data: await mutateTaxonomy<Genus>("genera", "PATCH", parsed.data, id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo actualizar el género." }; }
}

export async function deleteGenus(id: string) {
  revalidatePath("/dashboard/taxa/genera");
  try { await mutateTaxonomy("genera", "DELETE", undefined, id); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo eliminar el género." }; }
}
