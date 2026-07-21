"use server"

import { revalidatePath } from "next/cache";
import { EventInput, eventSchema } from "@/lib/validations/fonoteca";
import { Event } from "@/types/fonoteca";
import {
  getCrudPage,
  getCrudItem,
  mutateCrud,
} from "@/lib/backend/crud";

function formatEvent(item: any): Event {
  if (!item) return item;
  return {
    ...item,
    location: item.locations || item.location,
    institution: item.institutions || item.institution,
  } as Event;
}

export async function getEvents({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const res = await getCrudPage<any>("events", {
      page,
      limit,
      search,
    });

    const formattedData = (res.data || []).map(formatEvent);

    return {
      data: formattedData,
      count: res.meta.totalItems,
    };
  } catch (error: any) {
    console.error("error fetching events:", error);
    return { data: [] as Event[], count: 0, error: error.message || "Error al cargar eventos." };
  }
}

export async function getEvent(id: string) {
  try {
    const raw = await getCrudItem<any>("events", id);
    return { data: formatEvent(raw) };
  } catch (error: any) {
    return { error: error.message || "No se encontró el evento." };
  }
}

export async function createEvent(input: EventInput) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<any>("events", "POST", parsed.data);
    revalidatePath("/dashboard/events");
    return { success: true, data: formatEvent(data) };
  } catch (error: any) {
    return { error: error.message || "Error al crear evento." };
  }
}

export async function updateEvent(id: string, input: EventInput) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<any>("events", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    return { success: true, data: formatEvent(data) };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar evento." };
  }
}

export async function updateEventStatus(id: string, status: string) {
  try {
    const data = await mutateCrud<any>("events", "PATCH", { record_status: status }, id);
    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    return { success: true, data: formatEvent(data) };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar el estado del evento." };
  }
}

export async function deleteEvent(id: string) {
  try {
    await mutateCrud("events", "DELETE", undefined, id);
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al eliminar el evento." };
  }
}
