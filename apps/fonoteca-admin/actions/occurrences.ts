"use server"

import { revalidatePath } from "next/cache";
import { OccurrenceInput, occurrenceSchema } from "@/lib/validations/fonoteca";
import { Occurrence } from "@/types/fonoteca";
import { deleteR2Folder } from "./multimedia";
import {
  getCrudPage,
  getAllCrud,
  getCrudItem,
  mutateCrud,
  multipleDeleteCrud,
} from "@/lib/backend/crud";

function formatOccurrence(item: any): Occurrence {
  if (!item) return item;
  const taxon = item.taxa
    ? {
        ...item.taxa,
        genus: item.taxa.genera
          ? {
              ...item.taxa.genera,
              family: item.taxa.genera.families
                ? {
                    ...item.taxa.genera.families,
                    order_obj: item.taxa.genera.families.orders
                      ? {
                          ...item.taxa.genera.families.orders,
                          class_obj: item.taxa.genera.families.orders.classes,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      }
    : item.taxon;

  const collection = item.collections
    ? {
        ...item.collections,
        institution: item.collections.institutions,
      }
    : item.collection;

  return {
    ...item,
    taxon,
    location: item.locations || item.location,
    collection,
    event: item.events || item.event,
    ecosystem: item.ecosystems || item.ecosystem,
    multimedia: item.multimedia || [],
  } as Occurrence;
}

export async function getOccurrences({
  page = 1,
  limit = 10,
  search = "",
  taxonId = "",
  eventId = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  taxonId?: string;
  eventId?: string;
}) {
  try {
    const res = await getCrudPage<any>("occurrences", {
      page,
      limit,
      search,
      taxonId,
      eventId,
    });

    const formattedData = (res.data || []).map(formatOccurrence);

    return {
      data: formattedData,
      count: res.meta.totalItems,
    };
  } catch (error: any) {
    console.error("error fetching occurrences:", error);
    return { data: [] as Occurrence[], count: 0, error: error.message || "Error al cargar ocurrencias." };
  }
}

export async function getOccurrence(id: string) {
  try {
    const raw = await getCrudItem<any>("occurrences", id);
    return { data: formatOccurrence(raw) };
  } catch (error: any) {
    return { error: error.message || "No se encontró la ocurrencia." };
  }
}

export async function createOccurrence(input: OccurrenceInput) {
  const parsed = occurrenceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<any>("occurrences", "POST", parsed.data);
    revalidatePath("/dashboard/occurrences");
    return { success: true, data: formatOccurrence(data) };
  } catch (error: any) {
    return { error: error.message || "Error al crear ocurrencia." };
  }
}

export async function updateOccurrence(id: string, input: OccurrenceInput) {
  const parsed = occurrenceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = await mutateCrud<any>("occurrences", "PATCH", parsed.data, id);
    revalidatePath("/dashboard/occurrences");
    revalidatePath(`/dashboard/occurrences/${id}`);
    return { success: true, data: formatOccurrence(data) };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar ocurrencia." };
  }
}

export async function updateOccurrenceStatus(id: string, status: string) {
  try {
    const data = await mutateCrud<any>("occurrences", "PATCH", { record_status: status }, id);
    revalidatePath("/dashboard/occurrences");
    revalidatePath(`/dashboard/occurrences/${id}`);
    return { success: true, data: formatOccurrence(data) };
  } catch (error: any) {
    return { error: error.message || "Error al actualizar el estado de la ocurrencia." };
  }
}

export async function deleteOccurrence(id: string) {
  try {
    await mutateCrud("occurrences", "DELETE", undefined, id);

    // Cascade delete in R2
    try {
      await deleteR2Folder(`occurrences/${id}`);
    } catch (r2Err) {
      console.error(`Failed to delete R2 folder for occurrence ${id}:`, r2Err);
    }

    revalidatePath("/dashboard/occurrences");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al eliminar la ocurrencia." };
  }
}

export async function deleteOccurrences(ids: string[]) {
  try {
    await multipleDeleteCrud("occurrences", ids);

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
  } catch (error: any) {
    return { error: error.message || "Error al eliminar múltiples ocurrencias." };
  }
}

export async function getAllOccurrencesForExport({
  search = "",
  taxonId = "",
}: {
  search?: string;
  taxonId?: string;
}) {
  try {
    const data = await getAllCrud<any>("occurrences", {
      search,
      taxonId,
    });

    const formattedData = (data || []).map(formatOccurrence);
    return { data: formattedData };
  } catch (error: any) {
    console.error("error fetching all occurrences for export:", error);
    return { data: [] as Occurrence[] };
  }
}

export async function bulkCreateOccurrences(inputs: any[]) {
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

    try {
      await mutateCrud("occurrences", "POST", parsed.data);
      successCount++;
    } catch (err: any) {
      errorCount++;
      errors.push(`ID ${input.occurrenceID || '?'}: ${err.message || "Error al insertar"}`);
    }
  }

  revalidatePath("/dashboard/occurrences");
  return { success: true, successCount, errorCount, errors };
}
