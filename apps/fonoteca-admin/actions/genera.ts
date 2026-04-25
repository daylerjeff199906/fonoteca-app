"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { GenusInput, genusSchema } from "@/lib/validations/fonoteca";
import { Genus } from "@/types/fonoteca";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";

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
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("genera")
    .select("*, family:families(*)", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  if (family_id) {
    query = query.eq("family_id", family_id);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching genera:", error);
    return { data: [] as Genus[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Genus[],
    count: count || 0,
  };
}

export async function getGenus(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("genera")
    .select("*, family:families(*)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Genus };
}

export async function createGenus(input: GenusInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = genusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("genera")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/genera");
  return { success: true, data: (data as any) as Genus };
}

export async function updateGenus(id: string, input: GenusInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = genusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("genera")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/genera");
  revalidatePath(`/dashboard/taxa/genera/${id}`);
  return { success: true, data: (data as any) as Genus };
}

export async function deleteGenus(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("genera")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/genera");
  return { success: true };
}
