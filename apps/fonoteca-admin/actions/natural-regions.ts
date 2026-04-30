"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NaturalRegionInput, naturalRegionSchema } from "@/lib/validations/fonoteca";
import { NaturalRegion } from "@/types/fonoteca";

export async function getNaturalRegions({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("natural_regions")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching natural regions:", error);
    return { data: [] as NaturalRegion[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as NaturalRegion[],
    count: count || 0,
  };
}

export async function getNaturalRegion(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("natural_regions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as NaturalRegion };
}

export async function createNaturalRegion(input: NaturalRegionInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = naturalRegionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("natural_regions")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/natural-regions");
  return { success: true, data: (data as any) as NaturalRegion };
}

export async function updateNaturalRegion(id: string, input: NaturalRegionInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = naturalRegionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("natural_regions")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/natural-regions");
  return { success: true, data: (data as any) as NaturalRegion };
}

export async function deleteNaturalRegion(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("natural_regions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/natural-regions");
  return { success: true };
}
