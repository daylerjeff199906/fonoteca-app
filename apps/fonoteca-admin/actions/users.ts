
"use server"

import { cookies } from "next/headers"
import { createBioIntranetServer } from "@/utils/supabase/bio-intranet/server"
import { revalidatePath } from "next/cache"

const FONOTECA_MODULE_ID = "b799e97c-85cd-4073-ab96-583e13750899"

export async function assignUserRole(profileId: string, roleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        profile_id: profileId,
        role_id: roleId,
        module_id: FONOTECA_MODULE_ID
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

export async function removeUserRole(profileId: string, roleId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = await createBioIntranetServer(cookieStore)

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .match({
        profile_id: profileId,
        role_id: roleId,
        module_id: FONOTECA_MODULE_ID
      })

    if (error) throw error

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    console.error('Error removing role:', error)
    return { success: false, error: error.message }
  }
}
