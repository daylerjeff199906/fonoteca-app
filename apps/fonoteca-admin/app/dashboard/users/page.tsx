import { Metadata } from "next"
import { getSystemUsers } from "@/actions/system-users"
import { PageHeader } from "@/components/panel-admin/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SystemUsersClient } from "./users-client"

export const metadata: Metadata = {
  title: "Usuarios | Fonoteca Admin",
  description: "Administra los usuarios globales del sistema y sus roles.",
}

export default async function SystemUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const limit = 10;

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
        title="Usuarios"
        description="Administra las cuentas de usuario a nivel de sistema, así como sus roles principales."
      />

      <SystemUsersClient
        initialUsers={usersRes.data || []}
        totalCount={usersRes.meta?.totalItems || 0}
      />
    </div>
  )
}
