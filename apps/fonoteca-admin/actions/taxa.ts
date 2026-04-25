"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { TaxonInput, taxonSchema } from "@/lib/validations/fonoteca";
import { Taxon } from "@/types/fonoteca";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";

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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let selectStr = "*, genus:genera(*, family:families(*))";

  if (kingdom || family_id) {
    // !inner join translates to filter parent when children are verified
    selectStr = "*, genus:genera!inner(*, family:families!inner(*))";
  }

  let query = supabase
    .from("taxa")
    .select(selectStr, { count: "exact" });

  if (search) {
    query = query.or(`scientificName.ilike.%${search}%,vernacularName.ilike.%${search}%`);
  }

  if (genus_id) {
    query = query.eq("genus_id", genus_id);
  }

  if (family_id) {
    query = query.eq("genus.family_id", family_id);
  }

  if (kingdom) {
    query = query.eq("genus.family.kingdom", kingdom);
  }

  if (hasScientificName === "no") {
    query = query.or("scientificName.is.null,scientificName.eq.''");
  } else if (hasScientificName === "yes") {
    query = query.not("scientificName", "is", null).neq("scientificName", "");
  }

  if (hasVernacularName === "no") {
    query = query.or("vernacularName.is.null,vernacularName.eq.''");
  } else if (hasVernacularName === "yes") {
    query = query.not("vernacularName", "is", null).neq("vernacularName", "");
  }

  const { data, count, error } = await query
    .order("scientificName", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching taxa:", error);
    return { data: [] as Taxon[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Taxon[],
    count: count || 0,
  };
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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  let selectStr = "*, genus:genera(*, family:families(*))";

  if (kingdom || family_id) {
    selectStr = "*, genus:genera!inner(*, family:families!inner(*))";
  }

  let query = supabase
    .from("taxa")
    .select(selectStr);

  if (search) {
    query = query.or(`scientificName.ilike.%${search}%,vernacularName.ilike.%${search}%`);
  }

  if (genus_id) {
    query = query.eq("genus_id", genus_id);
  }

  if (family_id) {
    query = query.eq("genus.family_id", family_id);
  }

  if (kingdom) {
    query = query.eq("genus.family.kingdom", kingdom);
  }

  if (hasScientificName === "no") {
    query = query.or("scientificName.is.null,scientificName.eq.''");
  } else if (hasScientificName === "yes") {
    query = query.not("scientificName", "is", null).neq("scientificName", "");
  }

  if (hasVernacularName === "no") {
    query = query.or("vernacularName.is.null,vernacularName.eq.''");
  } else if (hasVernacularName === "yes") {
    query = query.not("vernacularName", "is", null).neq("vernacularName", "");
  }

  const { data, error } = await query
    .order("scientificName", { ascending: true });

  if (error) {
    console.error("error fetching taxa for export:", error);
    return { data: [] as Taxon[] };
  }

  return {
    data: (data as any) as Taxon[],
  };
}

export async function getTaxon(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("taxa")
    .select("*, genus:genera(*, family:families(*))")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Taxon };
}

export async function getGenera() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("genera")
    .select("*, family:families(name)")
    .order("name");

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

export async function getFamilies() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("families")
    .select("*")
    .order("name");

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

export async function createTaxon(input: TaxonInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = taxonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("taxa")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa");
  return { success: true, data: (data as any) as Taxon };
}

export async function updateTaxon(id: string, input: TaxonInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = taxonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("taxa")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa");
  revalidatePath(`/dashboard/taxa/${id}`);
  return { success: true, data: (data as any) as Taxon };
}

export async function deleteTaxon(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("taxa")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa");
  return { success: true };
}
