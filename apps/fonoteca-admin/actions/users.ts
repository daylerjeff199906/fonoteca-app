
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

    // 2. Fetch profiles
    // If no search is provided, we only show users who already have a role in this module
    // If search is provided, we search in all profiles to allow adding new ones
    let query = supabase
      .from('profiles')
      .select(`
        id, 
        first_name, 
        last_name, 
        email, 
        avatar_url,
        user_roles(role_id, module_id)
      `, { count: 'exact' })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    } else {
      // Use !inner only when not searching to filter strictly by module
      query = supabase
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
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, count, error } = await query
      .order('first_name', { ascending: true })
      .range(from, to)

    if (error) throw error

    // If we searched all profiles, the user_roles might contain roles from OTHER modules.
    // We need to filter them out manually for the UI.
    const filteredData = data?.map(profile => ({
      ...profile,
      user_roles: (profile.user_roles as any[] || []).filter(ur => ur.module_id === moduleId)
    })) || []

    return { 
      data: filteredData, 
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

    // Check if the role already exists to avoid unnecessary upsert
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .match({ profile_id: profileId, role_id: roleId, module_id: moduleId })
      .maybeSingle()

    if (existing) return { success: true }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        profile_id: profileId,
        role_id: roleId,
        module_id: moduleId
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

export async function removeUserFromModule(profileId: string, moduleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .match({
        profile_id: profileId,
        module_id: moduleId
      })

    if (error) throw error

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error removing user from module:', error)
    return { success: false, error: error.message }
  }
}

export async function createUser({ 
  first_name, 
  last_name, 
  email 
}: { 
  first_name: string, 
  last_name: string, 
  email: string 
}) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        first_name,
        last_name,
        email,
        onboarding_completed: false
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/users')
    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}
export async function getAvailableUsersForModule(moduleId: string, search: string = "") {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    // First, get all profile IDs that ARE in the module
    const { data: usersInModule } = await supabase
      .from('user_roles')
      .select('profile_id')
      .eq('module_id', moduleId)

    const excludedIds = usersInModule
      ?.map(u => u.profile_id)
      .filter((id): id is string => !!id) || []

    // Now get profiles NOT in that list
    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, avatar_url')
    
    if (excludedIds.length > 0) {
      // For large arrays, we might want to slice it, but for now 200 should be fine
      query = query.not('id', 'in', `(${excludedIds.join(',')})`)
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
      .order('first_name', { ascending: true })
      .limit(20)

    if (error) throw error
    return { data: data || [], success: true }
  } catch (error: any) {
    console.error('Error fetching available users:', error)
    return { data: [], success: false, error: error.message }
  }
}
export async function searchProfiles(search: string = "") {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, avatar_url')
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
      .order('first_name', { ascending: true })
      .limit(10)

    if (error) throw error
    return { data: data || [], success: true }
  } catch (error: any) {
    console.error('Error searching profiles:', error)
    return { data: [], success: false, error: error.message }
  }
}
