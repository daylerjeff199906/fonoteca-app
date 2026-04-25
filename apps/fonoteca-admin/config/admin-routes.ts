import { LucideIcon, LayoutDashboard, Layers, Map, ClipboardList, AudioLines } from "lucide-react"

export interface AdminRouteItem {
  title: string
  url: string
  icon?: any
  items?: {
    title: string
    url: string
  }[]
}

export const getAdminRoutes = (locale?: string): AdminRouteItem[] => {
  return [
    {
      title: "Inicio",
      url: `/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Taxonomía",
      url: "#",
      icon: Layers,
      items: [
        {
          title: "Catálogo de Taxones",
          url: `/dashboard/taxa`,
        },
      ],
    },
    {
      title: "Geografía",
      url: "#",
      icon: Map,
      items: [
        {
          title: "Ubicaciones",
          url: `/dashboard/locations`,
        },
      ],
    },
    {
      title: "Monitoreo",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Lista de Ocurrencias",
          url: `/dashboard/occurrences`,
        },
      ],
    },
    {
      title: "Mediateca",
      url: "#",
      icon: AudioLines,
      items: [
        {
          title: "Archivos Multimedia",
          url: `/dashboard/multimedia`,
        },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: "Operaciones Masivas",
          url: `/dashboard/bulk`,
        },
      ],
    },
  ]
}
