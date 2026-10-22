// Quién puede subir, modificar o eliminar multimedia. Función pura para usarla en
// servidor (rutas y acciones) y en la interfaz (ocultar controles sin privilegio).

export interface MediaActor {
  roles: string[]
  permissions: string[]
}

const WRITE_ROLES = ["ADMIN", "SUPERADMIN", "SUPER_ADMIN", "ROLE_ADMIN", "EDITOR", "ROLE_EDITOR"]
const WRITE_PERMISSIONS = ["*", "multimedia.write", "data.write"]

export function canWriteMedia(actor: MediaActor | null | undefined): boolean {
  if (!actor) return false
  return (
    actor.roles.some((role) => WRITE_ROLES.includes(role.toUpperCase())) ||
    actor.permissions.some((permission) => WRITE_PERMISSIONS.includes(permission))
  )
}
