'use client'
import * as React from 'react'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { getAdminRoutes } from '@/config/admin-routes'


interface UserData {
  name: string
  email: string
  avatar: string | null
  role: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userData?: UserData | null
}

export function AppSidebar({ userData, ...props }: AppSidebarProps) {
  const navMain = getAdminRoutes()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#ffffff] text-primary-foreground">
            <img src="/brands/logo-iiap.webp" alt="IIAP" className="size-6 object-contain" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-white uppercase tracking-tighter">IIAP Platform</span>
            <span className="truncate text-[10px] text-[#718e9a] font-medium uppercase">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

