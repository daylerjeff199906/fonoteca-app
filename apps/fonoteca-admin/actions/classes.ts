"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ClassInput, classSchema } from "@/lib/validations/fonoteca";
import { Class } from "@/types/fonoteca";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";

export async function getClassesPaginated({
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
    .from("classes")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching classes:", error);
    return { data: [] as Class[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Class[],
    count: count || 0,
  };
}

export async function getAllClasses() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

export async function getClass(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Class };
}

export async function createClass(input: ClassInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("classes")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/classes");
  return { success: true, data: (data as any) as Class };
}

export async function updateClass(id: string, input: ClassInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = classSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("classes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/classes");
  return { success: true, data: (data as any) as Class };
}

export async function deleteClass(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/classes");
  return { success: true };
}
