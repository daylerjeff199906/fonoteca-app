
"use server"

import { cookies } from "next/headers"
import { createBioIntranetServer } from "@/utils/supabase/bio-intranet/server"
import { revalidatePath } from "next/cache"

const FONOTECA_MODULE_ID = "b799e97c-85cd-4073-ab96-583e13750899"

export async function getUsers({ 
  page = 1, 
  limit = 10, 
  search = "" 
}: { 
  page?: number, 
  limit?: number, 
  search?: string 
}) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    // 1. Get the module ID for 'fonoteca'
    const { data: moduleData } = await supabase
      .from('modules')
      .select('id')
      .eq('code', 'fonoteca')
      .single()

    if (!moduleData) throw new Error("Módulo 'fonoteca' no encontrado")
    const moduleId = moduleData.id

    // 2. Fetch profiles that have a role in this module
    // We use a join with user_roles to filter by module_id
    let query = supabase
      .from('profiles')
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        avatar_url,
        user_roles!inner(role_id, module_id)
      `, { count: 'exact' })
      .eq('user_roles.module_id', moduleId)

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('first_name', { ascending: true })
      .range(from, to)

    if (error) throw error

    return { 
      data: data || [], 
      count: count || 0,
      moduleId,
      success: true 
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return { data: [], count: 0, success: false, error: error.message }
  }
}

export async function getAvailableRoles() {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name', { ascending: true })

    if (error) throw error
    return { data: data || [], success: true }
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    return { data: [], success: false, error: error.message }
  }
}

export async function getUserRoles(profileId: string, moduleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('profile_id', profileId)
      .eq('module_id', moduleId)

    if (error) throw error
    return { data: data || [], success: true }
  } catch (error: any) {
    console.error('Error fetching user roles:', error)
    return { data: [], success: false, error: error.message }
  }
}

export async function getModulePermissions(moduleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { data, error } = await supabase
      .from('permissions')
      .select('id, action')
      .eq('module_id', moduleId)

    if (error) throw error
    return { data: data || [], success: true }
  } catch (error: any) {
    console.error('Error fetching permissions:', error)
    return { data: [], success: false, error: error.message }
  }
}

export async function assignUserRole(profileId: string, roleId: string, moduleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        profile_id: profileId,
        role_id: roleId,
        module_id: moduleId
      }, {
        onConflict: 'profile_id, role_id, module_id'
      })

    if (error) throw error

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error assigning role:', error)
    return { success: false, error: error.message }
  }
}

export async function removeUserRole(profileId: string, roleId: string, moduleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .match({
        profile_id: profileId,
        role_id: roleId,
        module_id: moduleId
      })

    if (error) throw error

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error removing role:', error)
    return { success: false, error: error.message }
  }
}
