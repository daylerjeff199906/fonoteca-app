"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { OrderInput, orderSchema } from "@/lib/validations/fonoteca";
import { Order } from "@/types/fonoteca";
import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";

export async function getOrdersPaginated({
  page = 1,
  limit = 10,
  search = "",
  class_id = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  class_id?: string;
}) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select("*, class_obj:classes(*)", { count: "exact" });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (class_id) {
    query = query.eq("class_id", class_id);
  }

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("error fetching orders:", error);
    return { data: [] as Order[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Order[],
    count: count || 0,
  };
}

export async function getAllOrders() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("orders")
    .select("*, class_obj:classes(*)")
    .order("name");

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}

export async function getOrder(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("orders")
    .select("*, class_obj:classes(*)")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Order };
}

export async function createOrder(input: OrderInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/orders");
  return { success: true, data: (data as any) as Order };
}

export async function updateOrder(id: string, input: OrderInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("orders")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/orders");
  return { success: true, data: (data as any) as Order };
}

export async function deleteOrder(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/taxa/orders");
  return { success: true };
}
