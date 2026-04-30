"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { EcosystemInput, ecosystemSchema } from "@/lib/validations/fonoteca";
import { Ecosystem } from "@/types/fonoteca";

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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("ecosystems")
    .select("*, region:natural_regions(*)", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (region_id) {
    query = query.eq("region_id", region_id);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching ecosystems:", error);
    return { data: [] as Ecosystem[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Ecosystem[],
    count: count || 0,
  };
}

export async function getEcosystem(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("ecosystems")
    .select("*, region:natural_regions(*)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Ecosystem };
}

export async function createEcosystem(input: EcosystemInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = ecosystemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("ecosystems")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/ecosystems");
  revalidatePath("/dashboard/occurrences/create");
  return { success: true, data: (data as any) as Ecosystem };
}

export async function updateEcosystem(id: string, input: EcosystemInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = ecosystemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("ecosystems")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/ecosystems");
  return { success: true, data: (data as any) as Ecosystem };
}

export async function deleteEcosystem(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("ecosystems")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/geography/ecosystems");
  return { success: true };
}
