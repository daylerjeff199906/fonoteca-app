"use server"

import { revalidatePath } from "next/cache";
import { TaxonInput, taxonSchema } from "@/lib/validations/fonoteca";
import { Family, Genus, Taxon } from "@/types/fonoteca";
import { getAllTaxonomy, getTaxonomyItem, getTaxonomyPage, mutateTaxonomy } from "@/lib/backend/taxonomy";

export async function getTaxa({
  page = 1,
  limit = 10,
  search = "",
  kingdom = "",
  family_id = "",
  genus_id = "",
  hasScientificName = "all",
  hasVernacularName = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  kingdom?: string;
  family_id?: string;
  genus_id?: string;
  hasScientificName?: string;
  hasVernacularName?: string;
}) {
  try {
    const result = await getTaxonomyPage<Taxon>("taxa", { page, limit, search, parentId: genus_id });
    const data = result.data.filter((item) => !family_id || item.genus?.family_id === family_id).filter((item) => !kingdom || item.genus?.family?.order_obj?.class_obj?.kingdom === kingdom);
    return { data, count: family_id || kingdom ? data.length : result.meta.totalItems };
  } catch (error) { return { data: [] as Taxon[], count: 0, error: error instanceof Error ? error.message : "No se pudieron cargar los taxa." }; }
}

export async function getAllTaxaForExport({
  search = "",
  kingdom = "",
  family_id = "",
  genus_id = "",
  hasScientificName = "all",
  hasVernacularName = "all",
}: {
  search?: string;
  kingdom?: string;
  family_id?: string;
  genus_id?: string;
  hasScientificName?: string;
  hasVernacularName?: string;
}) {
  try {
    const result = await getAllTaxonomy<Taxon>("taxa", { search, parentId: genus_id });
    return { data: result.filter((item) => !family_id || item.genus?.family_id === family_id).filter((item) => !kingdom || item.genus?.family?.order_obj?.class_obj?.kingdom === kingdom) };
  } catch { return { data: [] as Taxon[] }; }
}

export async function getTaxon(id: string) {
  try { return { data: await getTaxonomyItem<Taxon>("taxa", id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo cargar el taxón." }; }
}

export async function getGenera(search: string = "") {
  try { return { data: await getAllTaxonomy<Genus>("genera", { search }) }; }
  catch (error) { return { data: [], error: error instanceof Error ? error.message : "No se pudieron cargar los géneros." }; }
}

export async function getFamilies() {
  try { return { data: await getAllTaxonomy<Family>("families") }; }
  catch (error) { return { data: [], error: error instanceof Error ? error.message : "No se pudieron cargar las familias." }; }
}

export async function createTaxon(input: TaxonInput) {
  const parsed = taxonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa");
  try { return { success: true, data: await mutateTaxonomy<Taxon>("taxa", "POST", parsed.data) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo crear el taxón." }; }
}

export async function updateTaxon(id: string, input: TaxonInput) {
  const parsed = taxonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa");
  revalidatePath(`/dashboard/taxa/${id}`);
  try { return { success: true, data: await mutateTaxonomy<Taxon>("taxa", "PATCH", parsed.data, id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo actualizar el taxón." }; }
}

export async function deleteTaxon(id: string) {
  revalidatePath("/dashboard/taxa");
  try { await mutateTaxonomy("taxa", "DELETE", undefined, id); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo eliminar el taxón." }; }
}
