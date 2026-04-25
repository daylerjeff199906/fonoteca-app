"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { EventInput, eventSchema } from "@/lib/validations/fonoteca";
import { Event } from "@/types/fonoteca";

export async function getEvents({
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
    .from("events")
    .select("*, locations(*)", { count: "exact" });

  if (search) {
    query = query.or(`eventID.ilike.%${search}%,samplingProtocol.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("error fetching events:", error);
    return { data: [] as Event[], count: 0, error: error.message };
  }

  const formattedData = (data || []).map((item: any) => ({
    ...item,
    location: item.locations,
  })) as Event[];

  return {
    data: formattedData,
    count: count || 0,
  };
}

export async function getEvent(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("events")
    .select("*, locations(*)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  const formattedData = {
    ...data,
    location: data.locations,
  } as Event;

  return { data: formattedData };
}

export async function createEvent(input: EventInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("events")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true, data: (data as any) as Event };
}

export async function updateEvent(id: string, input: EventInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${id}`);
  return { success: true, data: (data as any) as Event };
}

export async function deleteEvent(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/events");
  return { success: true };
}
