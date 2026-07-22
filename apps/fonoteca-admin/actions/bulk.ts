"use server";

import { revalidatePath } from "next/cache";
import { taxonSchema, occurrenceSchema, locationSchema, multimediaSchema } from "@/lib/validations/fonoteca";
import { z } from "zod";
import { mutateCrud } from "@/lib/backend/crud";

const SCHEMAS: Record<string, z.ZodObject<any>> = {
  taxa: taxonSchema as any,
  occurrences: occurrenceSchema as any,
  locations: locationSchema as any,
  multimedia: multimediaSchema as any,
};

export async function bulkUpsert(table: string, items: any[]) {
  const schema = SCHEMAS[table];
  if (!schema) {
    return { error: "Tabla no soportada" };
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  const validItems: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const parsed = schema.safeParse(item);
    if (!parsed.success) {
      errorCount++;
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.entries(fieldErrors)[0];
      
      if (firstError) {
        errors.push(`Fila ${i + 1}: Error en ${firstError[0]}: ${Array.isArray(firstError[1]) ? firstError[1].join(", ") : firstError[1]}`);
      } else {
        errors.push(`Fila ${i + 1}: Error de validación desconocido`);
      }
      continue;
    }

    validItems.push(parsed.data);
  }

  if (validItems.length > 0) {
    try {
      for (const item of validItems) {
        if (item.id) {
          await mutateCrud(table, "PATCH", item, item.id);
        } else {
          await mutateCrud(table, "POST", item);
        }
      }
      successCount = validItems.length;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error al procesar elementos",
        successCount: 0,
        errorCount: items.length,
        errors: [error instanceof Error ? error.message : "Error de base de datos"]
      };
    }
  }

  revalidatePath(`/dashboard/${table}`);
  return { success: true, successCount, errorCount, errors };
}
