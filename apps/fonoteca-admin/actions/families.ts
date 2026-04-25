"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FamilyInput, familySchema } from "@/lib/validations/fonoteca";
import { Family } from "@/types/fonoteca";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";

export async function getFamiliesPaginated({
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
    .from("families")
    .select("*, order_ref:orders(*)", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching families:", error);
    return { data: [] as Family[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Family[],
    count: count || 0,
  };
}

export async function getFamily(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("families")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Family };
}

export async function createFamily(input: FamilyInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = familySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("families")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/families");
  return { success: true, data: (data as any) as Family };
}

export async function updateFamily(id: string, input: FamilyInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = familySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("families")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/families");
  revalidatePath(`/dashboard/taxa/families/${id}`);
  return { success: true, data: (data as any) as Family };
}

export async function deleteFamily(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/families");
  return { success: true };
}
