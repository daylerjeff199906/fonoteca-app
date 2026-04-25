"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[#718e9a] font-bold uppercase tracking-wider text-[10px]">
        Módulos de Datos
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isDashboard = item.url === '/dashboard'
          const isActive = isDashboard
            ? pathname === item.url
            : (pathname === item.url || pathname.startsWith(item.url + "/"))

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "transition-colors duration-200 hover:bg-white/5",
                    isActive ? "text-white" : "text-[#718e9a]"
                  )}
                >
                  <Link href={item.url}>
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-200",
                          isActive
                            ? item.url === '/dashboard' ? "text-[#a3e635]" : "text-[#0ea5e9]"
                            : "text-[#718e9a]"
                        )}
                      />
                    )}
                    <span className="font-semibold">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      "transition-colors duration-200 hover:bg-white/5",
                      isActive ? "text-white" : "text-[#718e9a]"
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 transition-colors duration-200",
                          isActive ? "text-[#0ea5e9]" : "text-[#718e9a]"
                        )}
                      />
                    )}
                    <span className="font-semibold">{item.title}</span>
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isSubActive}
                            className={cn(
                              "transition-colors duration-200 hover:bg-white/5",
                              isSubActive ? "text-white" : "text-[#718e9a]"
                            )}
                          >
                            <Link href={subItem.url}>
                              <span className="font-medium">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
