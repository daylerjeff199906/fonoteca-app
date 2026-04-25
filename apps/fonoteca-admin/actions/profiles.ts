"use server"

import { createBioIntranetServer } from "@/utils/supabase/bio-intranet/server";
import { cookies } from "next/headers";

export async function getProfiles() {
  const cookieStore = await cookies();
  const supabase = await createBioIntranetServer(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .order("first_name", { ascending: true });

  if (error) {
    console.error("error fetching profiles:", error);
    return { data: [], error: error.message };
  }

  return { data };
}

export async function getCurrentProfile() {
  const cookieStore = await cookies();
  const supabase = await createBioIntranetServer(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No user found" };

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("auth_id", user.id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
