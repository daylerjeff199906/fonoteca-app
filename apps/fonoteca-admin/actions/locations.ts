"use server"

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LocationInput, locationSchema } from "@/lib/validations/fonoteca";
import { Location } from "@/types/fonoteca";

export async function getLocations({
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
    .from("locations")
    .select(`
      *,
      district:ubigeo_districts (
        id,
        name,
        province:ubigeo_provinces (
          id,
          name,
          department:ubigeo_departments (
            id,
            name
          )
        )
      )
    `, { count: "exact" });

  if (search) {
    query = query.or(`locality.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("error fetching locations:", error);
    return { data: [] as Location[], count: 0, error: error.message };
  }

  return {
    data: (data as any) as Location[],
    count: count || 0,
  };
}

export async function getLocation(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("locations")
    .select(`
      *,
      district:ubigeo_districts (
        id,
        name,
        province:ubigeo_provinces (
          id,
          name,
          department:ubigeo_departments (
            id,
            name
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: (data as any) as Location };
}

export async function getUbigeoDepartments() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { data, error } = await supabase
    .from("ubigeo_departments")
    .select("*")
    .order("name");

  if (error) return { error: error.message };
  return { data };
}

export async function getUbigeoProvinces(departmentId?: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  let query = supabase.from("ubigeo_provinces").select("*").order("name");
  if (departmentId) query = query.eq("department_id", departmentId);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data };
}

export async function getUbigeoDistricts(provinceId?: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  let query = supabase.from("ubigeo_districts").select("*").order("name");
  if (provinceId) query = query.eq("province_id", provinceId);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data };
}

export async function createLocation(input: LocationInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("locations")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/locations");
  return { success: true, data: (data as any) as Location };
}

export async function updateLocation(id: string, input: LocationInput) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from("locations")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/locations");
  revalidatePath(`/dashboard/locations/${id}`);
  revalidatePath(`/dashboard/locations/${id}/edit`);
  return { success: true, data: (data as any) as Location };
}

export async function deleteLocation(id: string) {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/locations");
  return { success: true };
}
