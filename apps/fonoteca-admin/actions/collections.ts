"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Collection } from "@/types/fonoteca";
import { CollectionInput } from "@/lib/validations/fonoteca";


export async function getCollections(filters?: { institution_id?: string; limit?: number }) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);
  
  let query = supabase
    .from("collections")
    .select("*, institution:institutions(*)")
    .neq("record_status", "deleted")
    .order("created_at", { ascending: false });

  if (filters?.institution_id) {
    query = query.eq("institution_id", filters.institution_id);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching collections:", error);
    return { data: [], error: error.message };
  }

  return { data: data as Collection[], error: null };
}

export async function getCollection(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);
  
  const { data, error } = await supabase
    .from("collections")
    .select("*, institution:institutions(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching collection:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Collection, error: null };
}

export async function createCollection(data: CollectionInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);
  
  const { data: newCollection, error } = await supabase
    .from("collections")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true, data: newCollection as Collection };
}

export async function updateCollection(id: string, data: Partial<CollectionInput>) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);
  
  const { data: updatedRecord, error } = await supabase
    .from("collections")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating collection:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true, data: updatedRecord as Collection };
}


export async function deleteCollection(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);
  
  const { error } = await supabase
    .from("collections")
    .update({ record_status: "deleted" })
    .eq("id", id);

  if (error) {
    console.error("Error deleting collection:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true };
}
