
import { Metadata } from "next"
import { cookies } from "next/headers"
import { createBioIntranetServer } from "@/utils/supabase/bio-intranet/server"
import { UsersClient } from "./users-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Fonoteca Admin",
  description: "Administra los usuarios y roles con acceso al módulo de Fonoteca.",
}

export default async function UsersPage() {
  const cookieStore = await cookies()
  const supabase = await createBioIntranetServer(cookieStore)

  // Module ID for Fonoteca
  const FONOTECA_MODULE_ID = "b799e97c-85cd-4073-ab96-583e13750899"

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, avatar_url')
    .order('first_name', { ascending: true })

  // Fetch all roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name, description')
    .order('name', { ascending: true })

  // Fetch user roles for the Fonoteca module
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('profile_id, role_id, roles(name)')
    .eq('module_id', FONOTECA_MODULE_ID)

  if (profilesError || rolesError || userRolesError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos de usuarios y roles.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Nota importante</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Esta sección gestiona únicamente los permisos y roles de los usuarios con acceso específico a este módulo de <strong>Fonoteca</strong>. Los cambios realizados aquí no afectarán el acceso de los usuarios a otros módulos del sistema.
        </AlertDescription>
      </Alert>

      <UsersClient 
        initialProfiles={profiles || []} 
        initialRoles={roles || []} 
        initialUserRoles={userRoles || []}
        moduleId={FONOTECA_MODULE_ID}
      />
    </div>
  )
}
