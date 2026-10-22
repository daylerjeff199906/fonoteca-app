// Modelo de roles del panel. Los roles son jerárquicos: cada uno hereda lo que puede hacer
// el anterior, por eso a una persona se le muestra y se le asigna un solo rol principal.
// Sin dependencias: se usa en servidor, en la interfaz, en scripts y en pruebas.

export const ROLE_HIERARCHY = ["VIEWER", "EDITOR", "ADMIN", "SUPERADMIN"] as const
export type RoleCode = (typeof ROLE_HIERARCHY)[number]

export const ROLE_INFO: Record<RoleCode, { name: string; description: string }> = {
  VIEWER: { name: "Visualizador", description: "Consulta la información del sistema sin modificarla." },
  EDITOR: { name: "Editor", description: "Registra y edita información: ocurrencias, eventos y multimedia." },
  ADMIN: { name: "Administrador", description: "Gestiona catálogos, configuración y las cuentas de Editores y Visualizadores." },
  SUPERADMIN: { name: "Superadministrador", description: "Control total del sistema, incluida la gestión de Administradores." },
}

/** Variantes de código que puede devolver el backend. */
const ROLE_ALIASES: Record<string, RoleCode> = {
  VIEWER: "VIEWER", ROLE_VIEWER: "VIEWER", LECTOR: "VIEWER", VISUALIZADOR: "VIEWER",
  EDITOR: "EDITOR", ROLE_EDITOR: "EDITOR",
  ADMIN: "ADMIN", ROLE_ADMIN: "ADMIN", ADMINISTRADOR: "ADMIN",
  SUPERADMIN: "SUPERADMIN", SUPER_ADMIN: "SUPERADMIN", ROLE_SUPERADMIN: "SUPERADMIN", SUPERADMINISTRADOR: "SUPERADMIN",
}

export function normalizeRole(code: string | null | undefined): RoleCode | null {
  if (!code) return null
  return ROLE_ALIASES[code.trim().toUpperCase()] ?? null
}

const level = (role: RoleCode) => ROLE_HIERARCHY.indexOf(role)

/** Rol de mayor jerarquía entre los asignados; null si no tiene ninguno reconocido. */
export function effectiveRole(codes: Array<string | null | undefined>): RoleCode | null {
  let best: RoleCode | null = null
  for (const code of codes) {
    const role = normalizeRole(code)
    if (role && (best === null || level(role) > level(best))) best = role
  }
  return best
}

/** Roles asignados que no aportan nada porque el rol principal ya los incluye. */
export function redundantRoles(codes: Array<string | null | undefined>): RoleCode[] {
  const top = effectiveRole(codes)
  if (!top) return []
  const present = new Set(codes.map(normalizeRole).filter((r): r is RoleCode => r !== null))
  return [...present].filter((role) => role !== top)
}

/** Códigos que el backend devuelve y este modelo no reconoce (se muestran aparte, nunca se ocultan). */
export function unknownRoles(codes: Array<string | null | undefined>): string[] {
  return codes.filter((code): code is string => Boolean(code) && normalizeRole(code) === null)
}

export function roleLabel(code: string | null | undefined): string {
  const role = normalizeRole(code)
  return role ? ROLE_INFO[role].name : code ? `Rol especial (${code})` : "Sin rol"
}

export function effectiveRoleLabel(codes: Array<string | null | undefined>): string {
  const top = effectiveRole(codes)
  return top ? ROLE_INFO[top].name : "Sin rol"
}

// --- Autorización para gestionar cuentas (mínimo privilegio) ---

/** Roles que quien actúa puede asignar: los inferiores al suyo; el Superadministrador puede asignarlos todos. */
export function assignableRoles(actorRoles: Array<string | null | undefined>): RoleCode[] {
  const actor = effectiveRole(actorRoles)
  if (actor === "SUPERADMIN") return [...ROLE_HIERARCHY]
  if (actor === "ADMIN") return ROLE_HIERARCHY.filter((role) => level(role) < level("ADMIN"))
  return []
}

export function canManageUsers(actorRoles: Array<string | null | undefined>): boolean {
  const actor = effectiveRole(actorRoles)
  return actor === "ADMIN" || actor === "SUPERADMIN"
}

export interface ManageCheck {
  allowed: boolean
  /** Motivo comprensible cuando no está permitido. */
  reason?: string
}

/** ¿Puede quien actúa modificar, reasignar o eliminar a la cuenta objetivo? */
export function canManageAccount(opts: {
  actorId: string
  actorRoles: Array<string | null | undefined>
  targetId: string
  targetRoles: Array<string | null | undefined>
}): ManageCheck {
  const { actorId, actorRoles, targetId, targetRoles } = opts
  if (!canManageUsers(actorRoles)) {
    return { allowed: false, reason: "Su rol no permite administrar cuentas de usuario." }
  }
  if (actorId === targetId) {
    return { allowed: false, reason: "No puede cambiar su propio rol ni eliminar su propia cuenta; solicite a otro administrador." }
  }
  const actor = effectiveRole(actorRoles)
  const target = effectiveRole(targetRoles)
  if (actor === "SUPERADMIN") return { allowed: true }
  if (target && level(target) >= level("ADMIN")) {
    return { allowed: false, reason: "Solo un Superadministrador puede administrar cuentas de Administradores." }
  }
  return { allowed: true }
}

/** Texto de ayuda de la pantalla de usuarios según el rol de quien la consulta. */
export function usersHelpText(actorRoles: Array<string | null | undefined>): string {
  switch (effectiveRole(actorRoles)) {
    case "SUPERADMIN":
      return "Como Superadministrador puede administrar todas las cuentas y asignar cualquier rol."
    case "ADMIN":
      return "Como Administrador puede administrar cuentas de Editores y Visualizadores. Para cambiar a otro Administrador, solicite a un Superadministrador."
    default:
      return "Consulte las cuentas del sistema. Su rol no permite modificarlas."
  }
}
