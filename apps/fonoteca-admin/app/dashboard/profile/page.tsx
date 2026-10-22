import { routeLabel } from "@/config/route-labels";
import { Metadata } from "next"
import { PageHeader } from "@/components/panel-admin/page-header"
import { ProfileClient } from "./profile-client"
import { getCurrentUser } from "@/lib/backend/auth"
import { summarizePermissions } from "@/lib/permission-labels"

export const metadata: Metadata = {
  title: "Mi Perfil | Fonoteca Admin",
  description: "Gestione su perfil y cambie su contraseña.",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title={routeLabel("/dashboard/profile")}
        description="Consulte sus datos y gestione la seguridad de su cuenta."
      />

      {/* Los permisos crudos se traducen aquí: al navegador solo llegan las etiquetas. */}
      <ProfileClient
        user={user ? { ...user, permissions: [] } : null}
        permissionSummary={summarizePermissions(user?.permissions ?? [])}
      />
    </div>
  )
}
