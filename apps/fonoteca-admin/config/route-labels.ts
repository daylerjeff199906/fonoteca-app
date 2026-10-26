// Fuente única de nombres de pantalla del panel: menú lateral, migas de pan y título superior.
// Los componentes no deben escribir estos textos a mano ni derivarlos de los segmentos de la URL.

export type RouteSection = "monitoring" | "taxonomy" | "geography" | "library" | "settings"

export interface Crumb {
  label: string
  /** Sin href: el elemento no es navegable (página actual o sección sin página propia). */
  href?: string
}

interface RouteEntry {
  /** Nombre corto: menú lateral y miga de pan. */
  label: string
  /** Título del encabezado; si falta se usa `label`. */
  title?: string
  section?: RouteSection
  /** Omite las rutas intermedias derivadas del path (p. ej. /dashboard/taxa para sus clases). */
  standalone?: boolean
}

export const SECTIONS: Record<RouteSection, Crumb> = {
  monitoring: { label: "Monitoreo", href: "/dashboard/monitoring" },
  taxonomy: { label: "Taxonomía" },
  geography: { label: "Geografía" },
  library: { label: "Mediateca" },
  settings: { label: "Configuración" },
}

/**
 * Páginas que existen en app/dashboard. `[id]` representa cualquier segmento dinámico.
 * Los títulos que dependen de un dato (p. ej. el código de una ocurrencia) los puede
 * sobrescribir la página con `LayoutWrapper sectionTitle`.
 */
const ROUTES: Record<string, RouteEntry> = {
  "/dashboard": { label: "Inicio", title: "Panel de control" },

  "/dashboard/monitoring/events": { label: "Eventos de muestreo", section: "monitoring" },
  "/dashboard/monitoring/events/new": { label: "Nuevo", title: "Registrar evento de muestreo", section: "monitoring" },
  "/dashboard/monitoring/events/[id]/edit": { label: "Editar", title: "Editar evento de muestreo", section: "monitoring" },
  "/dashboard/monitoring/register": { label: "Registrar colección", section: "monitoring" },
  "/dashboard/monitoring/register/events/new": { label: "Nuevo evento", title: "Paso 1: Registrar evento de muestreo", section: "monitoring" },
  "/dashboard/monitoring/register/events/[id]/occurrences": { label: "Ocurrencias", title: "Paso 2: Registrar ocurrencias del evento", section: "monitoring" },
  "/dashboard/monitoring/register/occurrences/new": { label: "Nueva ocurrencia", title: "Paso 1: Registrar ocurrencia", section: "monitoring" },
  "/dashboard/monitoring/register/occurrences/[id]/multimedia": { label: "Multimedia", title: "Último paso: Multimedia de la ocurrencia", section: "monitoring" },

  "/dashboard/occurrences": { label: "Lista de ocurrencias", section: "monitoring" },
  "/dashboard/occurrences/create": { label: "Nueva", title: "Registrar ocurrencia", section: "monitoring" },
  "/dashboard/occurrences/[id]": { label: "Detalle", title: "Detalle de la ocurrencia", section: "monitoring" },
  "/dashboard/occurrences/[id]/edit": { label: "Editar", title: "Editar ocurrencia", section: "monitoring" },
  "/dashboard/occurrences/[id]/multimedia": { label: "Multimedia", title: "Multimedia de la ocurrencia", section: "monitoring" },

  "/dashboard/taxa": { label: "Catálogo de especies", section: "taxonomy" },
  "/dashboard/taxa/classes": { label: "Clases", section: "taxonomy", standalone: true },
  "/dashboard/taxa/orders": { label: "Órdenes", section: "taxonomy", standalone: true },
  "/dashboard/taxa/families": { label: "Familias", section: "taxonomy", standalone: true },
  "/dashboard/taxa/genera": { label: "Géneros", section: "taxonomy", standalone: true },

  "/dashboard/geography/institutions": { label: "Instituciones", section: "geography" },
  "/dashboard/geography/institutions/create": { label: "Nueva", title: "Registrar institución", section: "geography" },
  "/dashboard/geography/institutions/[id]/edit": { label: "Editar", title: "Editar institución", section: "geography" },
  "/dashboard/geography/natural-regions": { label: "Regiones naturales", section: "geography" },
  "/dashboard/geography/natural-regions/[id]/edit": { label: "Editar", title: "Editar región natural", section: "geography" },
  "/dashboard/geography/ecosystems": { label: "Hábitats", section: "geography" },
  "/dashboard/geography/ecosystems/create": { label: "Nuevo", title: "Registrar hábitat", section: "geography" },
  "/dashboard/geography/ecosystems/[id]/edit": { label: "Editar", title: "Editar hábitat", section: "geography" },
  "/dashboard/locations": { label: "Ubicaciones", section: "geography" },
  "/dashboard/locations/create": { label: "Nueva", title: "Registrar ubicación", section: "geography" },
  "/dashboard/locations/[id]/edit": { label: "Editar", title: "Editar ubicación", section: "geography" },

  "/dashboard/multimedia": { label: "Archivos multimedia", section: "library" },
  "/dashboard/multimedia/create": { label: "Subir archivo", title: "Subir archivo multimedia", section: "library" },
  "/dashboard/multimedia/[id]/edit": { label: "Editar", title: "Editar archivo multimedia", section: "library" },
  "/dashboard/multimedia/client-edit": { label: "Editar", title: "Editar archivo multimedia", section: "library" },
  "/dashboard/audio-requests": { label: "Solicitudes de audio", section: "library" },

  "/dashboard/bulk": { label: "Operaciones masivas", section: "settings" },
  "/dashboard/users": { label: "Usuarios", section: "settings" },
  "/dashboard/profile": { label: "Mi perfil", section: "settings" },
}

/** Etiquetas de segmentos finales que no tienen entrada propia en ROUTES. */
const SEGMENT_LABELS: Record<string, string> = {
  new: "Nuevo",
  create: "Nuevo",
  edit: "Editar",
  occurrences: "Ocurrencias",
  multimedia: "Multimedia",
}

const HOME: Crumb = { label: "Inicio", href: "/dashboard" }

const segmentsOf = (pathname: string) => pathname.split("?")[0].split("/").filter(Boolean)

/** Busca la entrada de una ruta; prefiere la coincidencia literal sobre la dinámica. */
function lookup(segments: string[]): RouteEntry | undefined {
  const literal = ROUTES[`/${segments.join("/")}`]
  if (literal) return literal

  let best: { entry: RouteEntry; wildcards: number } | undefined
  for (const [pattern, entry] of Object.entries(ROUTES)) {
    const parts = pattern.split("/").filter(Boolean)
    if (parts.length !== segments.length) continue
    let wildcards = 0
    const matches = parts.every((part, i) => {
      if (part === "[id]") {
        wildcards += 1
        return true
      }
      return part === segments[i]
    })
    if (matches && (!best || wildcards < best.wildcards)) best = { entry, wildcards }
  }
  return best?.entry
}

/** Nombre de una ruta fija (menú lateral). Lanza error si la ruta no está en el mapa. */
export function routeLabel(path: string): string {
  const entry = ROUTES[path]
  if (!entry) throw new Error(`Ruta sin etiqueta en config/route-labels.ts: ${path}`)
  return entry.label
}

/** Título del encabezado superior para una ruta. */
export function getPageTitle(pathname: string): string | null {
  const entry = lookup(segmentsOf(pathname))
  return entry ? (entry.title ?? entry.label) : null
}

/** Rutas conocidas, para pruebas y auditorías. */
export const ROUTE_PATTERNS = Object.keys(ROUTES)

/** Resuelve las migas de pan de una ruta del dashboard. La última no lleva href. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  const segments = segmentsOf(pathname)
  if (segments[0] !== "dashboard" || segments.length === 1) return [{ label: HOME.label }]

  const trail: { segments: string[]; entry?: RouteEntry }[] = []
  for (let i = 2; i <= segments.length; i++) {
    const slice = segments.slice(0, i)
    trail.push({ segments: slice, entry: lookup(slice) })
  }

  const leaf = trail[trail.length - 1]
  const crumbs: Crumb[] = [HOME]

  const sectionEntry = [...trail].reverse().find((t) => t.entry?.section)?.entry
  if (sectionEntry?.section) crumbs.push(SECTIONS[sectionEntry.section])

  const standaloneIdx = trail.map((t) => t.entry?.standalone).lastIndexOf(true)
  trail.forEach((step, index) => {
    if (index < standaloneIdx) return
    const isLeaf = step === leaf
    if (!step.entry && !isLeaf) return
    const last = step.segments[step.segments.length - 1]
    const label = step.entry?.label ?? SEGMENT_LABELS[last] ?? "Detalle"
    crumbs.push({ label, href: isLeaf ? undefined : `/${step.segments.join("/")}` })
  })

  return crumbs
}
