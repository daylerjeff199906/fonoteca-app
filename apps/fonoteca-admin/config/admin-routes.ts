import { LucideIcon, LayoutDashboard, Layers, Map, ClipboardList, AudioLines } from "lucide-react"
import { SECTIONS, routeLabel } from "@/config/route-labels"

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
      title: routeLabel("/dashboard"),
      url: `/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: SECTIONS.taxonomy.label,
      url: "#",
      icon: Layers,
      items: [
        {
          title: routeLabel("/dashboard/taxa/classes"),
          url: `/dashboard/taxa/classes`,
        },
        {
          title: routeLabel("/dashboard/taxa/orders"),
          url: `/dashboard/taxa/orders`,
        },
        {
          title: routeLabel("/dashboard/taxa/families"),
          url: `/dashboard/taxa/families`,
        },
        {
          title: routeLabel("/dashboard/taxa/genera"),
          url: `/dashboard/taxa/genera`,
        },
        {
          title: routeLabel("/dashboard/taxa"),
          url: `/dashboard/taxa`,
        },
      ],
    },
    {
      title: SECTIONS.geography.label,
      url: "#",
      icon: Map,
      items: [
        {
          title: routeLabel("/dashboard/geography/institutions"),
          url: `/dashboard/geography/institutions`,
        },
        {
          title: routeLabel("/dashboard/geography/natural-regions"),
          url: `/dashboard/geography/natural-regions`,
        },
        {
          title: routeLabel("/dashboard/geography/ecosystems"),
          url: `/dashboard/geography/ecosystems`,
        },
        {
          title: routeLabel("/dashboard/locations"),
          url: `/dashboard/locations`,
        },
      ],
    },
    {
      title: SECTIONS.monitoring.label,
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: routeLabel("/dashboard/monitoring/register"),
          url: `/dashboard/monitoring/register`,
        },
        {
          title: routeLabel("/dashboard/occurrences"),
          url: `/dashboard/occurrences`,
        },
        {
          title: routeLabel("/dashboard/monitoring/events"),
          url: `/dashboard/monitoring/events`,
        },
      ],
    },
    {
      title: SECTIONS.library.label,
      url: "#",
      icon: AudioLines,
      items: [
        {
          title: routeLabel("/dashboard/multimedia"),
          url: `/dashboard/multimedia`,
        },
        {
          title: routeLabel("/dashboard/audio-requests"),
          url: `/dashboard/audio-requests`,
        },
      ],
    },
    {
      title: SECTIONS.settings.label,
      url: "#",
      icon: ClipboardList,
      items: [
        {
          title: routeLabel("/dashboard/bulk"),
          url: `/dashboard/bulk`,
        },
        {
          title: routeLabel("/dashboard/users"),
          url: `/dashboard/users`,
        },
        {
          title: routeLabel("/dashboard/profile"),
          url: `/dashboard/profile`,
        },
      ],
    },
  ]
}
