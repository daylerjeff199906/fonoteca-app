import { Metadata } from "next"
import { UsersClient } from "./users-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { getAvailableRoles, getModulePermissions, getUsers } from "@/actions/users"
import { PageHeader } from "@/components/panel-admin/page-header"

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Fonoteca Admin",
  description: "Administra los usuarios y roles con acceso al módulo de Fonoteca.",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const limit = 10;

  const [usersRes, rolesRes] = await Promise.all([
    getUsers({ page, limit, search }),
    getAvailableRoles()
  ])

  if (!usersRes.success || !rolesRes.success) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {usersRes.error || rolesRes.error || "No se pudieron cargar los datos de usuarios y roles."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const permissionsRes = await getModulePermissions(usersRes.moduleId!)

  // Pre-fetch roles for the users in this page to avoid many client requests
  // However, we can also just fetch them in the client since we have the data already in user_roles join
  // Let's transform the data to match the expected initialUserRoles format
  const initialUserRoles = usersRes.data.flatMap((u: any) =>
    u.user_roles.map((ur: any) => ({
      profile_id: u.id,
      role_id: ur.role_id,
      roles: rolesRes.data.find((r: any) => r.id === ur.role_id) || null
    }))
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Usuarios" 
        description="Administra los permisos y roles de los usuarios con acceso al módulo de Fonoteca."
      />
      
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-none">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Nota importante</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Esta sección gestiona únicamente los permisos y roles de los usuarios con acceso específico a este módulo de <strong>Fonoteca</strong>.
        </AlertDescription>
      </Alert>

      <UsersClient 
        initialProfiles={usersRes.data} 
        initialRoles={rolesRes.data} 
        initialUserRoles={initialUserRoles}
        moduleId={usersRes.moduleId!}
        totalCount={usersRes.count}
        initialPermissions={permissionsRes.data || []}
      />
    </div>
  )
}
