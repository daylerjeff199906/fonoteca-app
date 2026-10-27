"use server"

import { revalidatePath } from "next/cache";
import { OrderInput, orderSchema } from "@/lib/validations/fonoteca";
import { Order } from "@/types/fonoteca";
import { getAllTaxonomy, getTaxonomyItem, getTaxonomyPage, mutateTaxonomy } from "@/lib/backend/taxonomy";

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
  try { const result = await getTaxonomyPage<Order>("orders", { page, limit, search, parentId: class_id }); return { data: result.data, count: result.meta.totalItems }; }
  catch (error) { return { data: [] as Order[], count: 0, error: error instanceof Error ? error.message : "No se pudieron cargar los órdenes." }; }
}

export async function getAllOrders() {
  try { return { data: await getAllTaxonomy<Order>("orders") }; }
  catch (error) { return { data: [], error: error instanceof Error ? error.message : "No se pudieron cargar los órdenes." }; }
}

export async function getOrder(id: string) {
  try { return { data: await getTaxonomyItem<Order>("orders", id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo cargar el orden." }; }
}

export async function createOrder(input: OrderInput) {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/orders");
  try { return { success: true, data: await mutateTaxonomy<Order>("orders", "POST", parsed.data) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo crear el orden." }; }
}

export async function updateOrder(id: string, input: OrderInput) {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  revalidatePath("/dashboard/taxa/orders");
  try { return { success: true, data: await mutateTaxonomy<Order>("orders", "PATCH", parsed.data, id) }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo actualizar el orden." }; }
}

export async function deleteOrder(id: string) {
  revalidatePath("/dashboard/taxa/orders");
  try { await mutateTaxonomy("orders", "DELETE", undefined, id); return { success: true }; } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo eliminar el orden." }; }
}
