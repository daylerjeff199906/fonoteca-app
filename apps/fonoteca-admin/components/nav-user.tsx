"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, SparklesIcon, BadgeCheckIcon, CreditCardIcon, BellIcon, LogOutIcon, UserIcon } from "lucide-react"
import { signout } from "@/actions/auth"

interface NavUserProps {
  user?: {
    name: string
    email: string
    avatar: string | null
  } | null
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()

  const userData = user || {
    name: "Usuario",
    email: "usuario@iiap.gob.pe",
    avatar: null,
  }

  const handleSignOut = async () => {
    await signout()
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || name === 'Usuario') return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="transition-colors duration-200 hover:bg-white/5 active:bg-white/10 aria-expanded:bg-white/10"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={userData.avatar || ''} alt={userData.name} />
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                {userData.avatar ? getInitials(userData.name) : <UserIcon className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-white">{userData.name}</span>
              <span className="truncate text-xs text-[#718e9a]">{userData.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-[#718e9a]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg dark bg-[#001429] border-[#ffffff]/10 text-white"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    <AvatarImage src={userData.avatar || ''} alt={userData.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                       {userData.avatar ? getInitials(userData.name) : <UserIcon className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userData.name}</span>
                    <span className="truncate text-xs">{userData.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparklesIcon />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

