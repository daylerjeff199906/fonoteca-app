// Traduce permisos técnicos (p. ej. "data.read", "*") a etiquetas comprensibles.
// Los permisos que no están en el glosario no se muestran con su código crudo.

const ACTION_LABELS: Record<string, string> = {
  read: "Consultar",
  write: "Registrar y editar",
  create: "Registrar",
  update: "Editar",
  delete: "Eliminar",
  manage: "Administrar",
  export: "Exportar",
  approve: "Aprobar",
}

const RESOURCE_LABELS: Record<string, string> = {
  data: "información del sistema",
  taxa: "taxonomía",
  taxonomy: "taxonomía",
  occurrences: "ocurrencias",
  events: "eventos de muestreo",
  multimedia: "archivos multimedia",
  locations: "ubicaciones",
  geography: "geografía",
  users: "cuentas de usuario",
  roles: "roles",
  audio_requests: "solicitudes de audio",
}

export function permissionLabel(permission: string): string | null {
  const code = permission.trim()
  if (code === "*") return "Acceso total al sistema"
  const [resource, action, ...rest] = code.toLowerCase().split(".")
  if (rest.length > 0 || !resource || !action) return null
  const actionLabel = ACTION_LABELS[action]
  const resourceLabel = RESOURCE_LABELS[resource]
  return actionLabel && resourceLabel ? `${actionLabel} ${resourceLabel}` : null
}

/**
 * Etiquetas para mostrar a la propia persona. Elimina duplicados y, si tiene acceso total,
 * no lista el resto. Los permisos sin traducción se resumen en un contador, sin exponer su código.
 */
export function summarizePermissions(permissions: string[]): { labels: string[]; hidden: number } {
  if (permissions.some((p) => p.trim() === "*")) return { labels: ["Acceso total al sistema"], hidden: 0 }
  const labels = new Set<string>()
  let hidden = 0
  for (const permission of permissions) {
    const label = permissionLabel(permission)
    if (label) labels.add(label)
    else hidden += 1
  }
  return { labels: [...labels], hidden }
}
