import { Metadata } from "next"
import { PageHeader } from "@/components/panel-admin/page-header"
import { ProfileClient } from "./profile-client"
import { getCurrentUser } from "@/lib/backend/auth"

export const metadata: Metadata = {
  title: "Mi Perfil | Fonoteca Admin",
  description: "Gestiona tu perfil y cambia tu contraseña.",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Visualiza tus datos y gestiona la seguridad de tu cuenta."
      />

      <ProfileClient user={user} />
    </div>
  )
}
