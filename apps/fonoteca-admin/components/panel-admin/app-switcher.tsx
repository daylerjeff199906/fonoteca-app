'use client'

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LayoutGridIcon } from "lucide-react"

interface AppSwitcherProps {
  teams: {
    name: string
    logo: string
    plan: string
    url: string
  }[]
}

export function AppSwitcher({ teams }: AppSwitcherProps) {
  if (!teams || teams.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9 rounded-lg" />
        }
      >
        <LayoutGridIcon className="size-5 text-muted-foreground" />
        <span className="sr-only">Switch Apps</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-xl p-2 border-[#ffffff]/10"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aplicaciones Disponibles
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mx-0 my-1" />
        <DropdownMenuGroup className="grid gap-1">
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.name}
              onClick={() => {
                if (team.url && team.url !== '#' && team.url !== '/') {
                  window.open(team.url, "_blank")
                } else if (team.url === '/') {
                  window.location.href = '/'
                }
              }}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors focus:bg-accent"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-muted/50 p-1">
                <img src={team.logo} alt={team.name} className="size-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{team.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{team.plan}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
