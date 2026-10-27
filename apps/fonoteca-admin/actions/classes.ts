"use server"

import { revalidatePath } from "next/cache";
import { ClassInput, classSchema } from "@/lib/validations/fonoteca";
import { Class } from "@/types/fonoteca";
import { getAllTaxonomy, getTaxonomyItem, getTaxonomyPage, mutateTaxonomy } from "@/lib/backend/taxonomy";

export async function getClassesPaginated({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const result = await getTaxonomyPage<Class>("classes", { page, limit, search });
    return { data: result.data, count: result.meta.totalItems };
  } catch (error) { return { data: [] as Class[], count: 0, error: error instanceof Error ? error.message : "No se pudieron cargar las clases." }; }
}

export async function getAllClasses() {
  try { return { data: await getAllTaxonomy<Class>("classes") }; }
  catch (error) { return { data: [], error: error instanceof Error ? error.message : "No se pudieron cargar las clases." }; }
}

export async function getClass(id: string) {
  try { return { data: await getTaxonomyItem<Class>("classes", id) }; }
  catch (error) { return { error: error instanceof Error ? error.message : "No se pudo cargar la clase." }; }
}

export async function createClass(input: ClassInput) {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/classes");
  try { return { success: true, data: await mutateTaxonomy<Class>("classes", "POST", parsed.data) }; }
  catch (error) { return { error: error instanceof Error ? error.message : "No se pudo crear la clase." }; }
}

export async function updateClass(id: string, input: ClassInput) {
  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/classes");
  try { return { success: true, data: await mutateTaxonomy<Class>("classes", "PATCH", parsed.data, id) }; }
  catch (error) { return { error: error instanceof Error ? error.message : "No se pudo actualizar la clase." }; }
}

export async function deleteClass(id: string) {
  revalidatePath("/dashboard/taxa/classes");
  try { await mutateTaxonomy("classes", "DELETE", undefined, id); return { success: true }; }
  catch (error) { return { error: error instanceof Error ? error.message : "No se pudo eliminar la clase." }; }
}
