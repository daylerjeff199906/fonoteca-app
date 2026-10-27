import { routeLabel } from "@/config/route-labels";
import { Metadata } from "next"
import { getSystemUsers } from "@/actions/system-users"
import { PageHeader } from "@/components/panel-admin/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SystemUsersClient } from "./users-client"
import { getCurrentUser } from "@/lib/backend/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Usuarios | Fonoteca Admin",
  description: "Cuentas de usuario del sistema y su rol principal.",
}

export default async function SystemUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  const actor = await getCurrentUser()
  if (!actor) redirect("/login")

  const usersRes = await getSystemUsers({ page, limit, search })

  if (!usersRes.success) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {usersRes.error || "No se pudieron cargar los datos de usuarios."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={routeLabel("/dashboard/users")}
        description="Cuentas de usuario del sistema y su rol principal."
      />

      <SystemUsersClient
        initialUsers={usersRes.data || []}
        totalCount={usersRes.meta?.totalItems || 0}
        actor={{ id: actor.id, roles: actor.roles }}
      />
    </div>
  )
}
