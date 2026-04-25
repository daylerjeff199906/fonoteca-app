"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { OccurrenceInput, occurrenceSchema } from "@/lib/validations/fonoteca";
import { Occurrence } from "@/types/fonoteca";
import { deleteR2Folder } from "./multimedia";

export async function getOccurrences({
  page = 1,
  limit = 10,
  search = "",
  taxonId = "",
  hasImage = "all", // "all", "yes", "no"
  hasAudio = "all", // "all", "yes", "no"
  eventId = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  taxonId?: string;
  hasImage?: string;
  hasAudio?: string;
  eventId?: string;
}) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("occurrences")
    .select("*, taxa(*), locations(*), multimedia(*)", { count: "exact" });

  if (search) {
    query = query.or(`occurrenceID.ilike.%${search}%,recordedBy.ilike.%${search}%,catalogNumber.ilike.%${search}%`);
  }

  if (taxonId) {
    query = query.eq("taxon_id", taxonId);
  }

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  // Media filtering
  if (hasImage === "yes" || hasImage === "no") {
    const { data: imageIds } = await supabase
      .from("multimedia")
      .select("occurrence_id")
      .eq("type", "Still");
    const ids = Array.from(new Set(imageIds?.map((m) => m.occurrence_id) || []));
    if (hasImage === "yes") {
      query = query.in("id", ids);
    } else {
      query = query.not("id", "in", `(${ids.length > 0 ? ids.join(",") : "00000000-0000-0000-0000-000000000000"})`);
    }
  }

  if (hasAudio === "yes" || hasAudio === "no") {
    const { data: audioIds } = await supabase
      .from("multimedia")
      .select("occurrence_id")
      .eq("type", "Sound");
    const ids = Array.from(new Set(audioIds?.map((m) => m.occurrence_id) || []));
    if (hasAudio === "yes") {
      query = query.in("id", ids);
    } else {
      query = query.not("id", "in", `(${ids.length > 0 ? ids.join(",") : "00000000-0000-0000-0000-000000000000"})`);
    }
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("error fetching occurrences:", error);
    return { data: [] as Occurrence[], count: 0, error: error.message };
  }

  // Map supabase structure to our expected nested structure
  const formattedData = (data || []).map((item: any) => ({
    ...item,
    taxon: item.taxa,
    location: item.locations,
    multimedia: item.multimedia,
  })) as Occurrence[];

  return {
    data: formattedData,
    count: count || 0,
  };
}

export async function getOccurrence(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("occurrences")
    .select("*, taxa(*), locations(*)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  const formattedData = {
    ...data,
    taxon: data.taxa,
    location: data.locations,
  } as Occurrence;

  return { data: formattedData };
}

export async function createOccurrence(input: OccurrenceInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = occurrenceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("occurrences")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true, data: (data as any) as Occurrence };
}

export async function updateOccurrence(id: string, input: OccurrenceInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = occurrenceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("occurrences")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/occurrences");
  revalidatePath(`/dashboard/occurrences/${id}`);
  return { success: true, data: (data as any) as Occurrence };
}

export async function deleteOccurrence(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("occurrences")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Cascade delete in R2
  try {
    await deleteR2Folder(`occurrences/${id}`);
  } catch (r2Err) {
    console.error(`Failed to delete R2 folder for occurrence ${id}:`, r2Err);
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true };
}

export async function deleteOccurrences(ids: string[]) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("occurrences")
    .delete()
    .in("id", ids);

  if (error) {
    return { error: error.message };
  }

  // Cascade delete in R2
  for (const id of ids) {
    try {
      await deleteR2Folder(`occurrences/${id}`);
    } catch (r2Err) {
      console.error(`Failed to delete R2 folder for occurrence ${id}:`, r2Err);
    }
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true };
}

export async function getAllOccurrencesForExport({
  search = "",
  taxonId = "",
  hasImage = "all",
  hasAudio = "all",
}: {
  search?: string;
  taxonId?: string;
  hasImage?: string;
  hasAudio?: string;
}) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  let query = supabase
    .from("occurrences")
    .select("*, taxa(*), locations(*), multimedia(*)");

  if (search) {
    query = query.or(`occurrenceID.ilike.%${search}%,recordedBy.ilike.%${search}%,catalogNumber.ilike.%${search}%`);
  }

  if (taxonId) {
    query = query.eq("taxon_id", taxonId);
  }

  // Media filtering (simplified for export, ideally should match getOccurrences logic)
  if (hasImage === "yes" || hasImage === "no") {
    const { data: imageIds } = await supabase
      .from("multimedia")
      .select("occurrence_id")
      .eq("type", "Still");
    const ids = Array.from(new Set(imageIds?.map((m) => m.occurrence_id) || []));
    if (hasImage === "yes") {
      query = query.in("id", ids);
    } else {
      query = query.not("id", "in", `(${ids.length > 0 ? ids.join(",") : "00000000-0000-0000-0000-000000000000"})`);
    }
  }

  if (hasAudio === "yes" || hasAudio === "no") {
    const { data: audioIds } = await supabase
      .from("multimedia")
      .select("occurrence_id")
      .eq("type", "Sound");
    const ids = Array.from(new Set(audioIds?.map((m) => m.occurrence_id) || []));
    if (hasAudio === "yes") {
      query = query.in("id", ids);
    } else {
      query = query.not("id", "in", `(${ids.length > 0 ? ids.join(",") : "00000000-0000-0000-0000-000000000000"})`);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("error fetching all occurrences for export:", error);
    return { data: [] as Occurrence[] };
  }

  const formattedData = (data || []).map((item: any) => ({
    ...item,
    taxon: item.taxa,
    location: item.locations,
    multimedia: item.multimedia,
  })) as Occurrence[];

  return { data: formattedData };
}

export async function bulkCreateOccurrences(inputs: any[]) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const input of inputs) {
    const parsed = occurrenceSchema.safeParse(input);
    
    if (!parsed.success) {
      errorCount++;
      errors.push(`ID ${input.occurrenceID || '?'}: Error validación de campos`);
      continue;
    }

    const { error } = await supabase.from("occurrences").insert([parsed.data]);
    if (error) {
      errorCount++;
      errors.push(`ID ${input.occurrenceID || '?'}: ${error.message}`);
    } else {
      successCount++;
    }
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true, successCount, errorCount, errors };
}
