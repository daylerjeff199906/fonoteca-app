"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { taxonSchema, occurrenceSchema, locationSchema, multimediaSchema } from "@/lib/validations/fonoteca";
import { z } from "zod";

const SCHEMAS: Record<string, z.ZodObject<any>> = {
  taxa: taxonSchema as any,
  occurrences: occurrenceSchema as any,
  locations: locationSchema as any,
  multimedia: multimediaSchema as any,
};

export async function bulkUpsert(table: string, items: any[]) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const schema = SCHEMAS[table];
  if (!schema) {
    return { error: "Tabla no soportada" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  let profileId = "00000000-0000-0000-0000-000000000000";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single();
    if (profile) profileId = profile.id;
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Prepared data
  const validItems: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Add profile_id for occurrences if not present
    if (table === "occurrences" && !item.profile_id) {
       item.profile_id = profileId;
    }

    // Basic cleaning: convert empty strings to null for certain fields if needed
    // Actually, our zod schemas already handle some of this with preprocessors or nullable()
    
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
    // Supabase upsert uses the primary key or unique constraints.
    // We assume 'id' is the primary key and should be present if updating.
    // If we want to upsert based on other keys (like occurrenceID), we should specify onConflict.
    
    let onConflict = 'id';
    if (table === 'occurrences') onConflict = 'occurrenceID';
    if (table === 'taxa') onConflict = 'scientificName'; // Or taxonID if preferred

    const { error } = await supabase.from(table).upsert(validItems, {
      onConflict: onConflict
    });

    if (error) {
      return { 
        success: false, 
        error: error.message,
        successCount: 0,
        errorCount: items.length,
        errors: [`Error de base de datos: ${error.message}`]
      };
    }
    
    successCount = validItems.length;
  }

  revalidatePath(`/dashboard/${table}`);
  return { success: true, successCount, errorCount, errors };
}
