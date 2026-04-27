"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSwitcher } from "./app-switcher"
import { useTeams } from "@/components/providers/teams-provider"
import { DynamicBreadcrumbs } from "./dynamic-breadcrumbs"

interface SiteHeaderProps {
    sectionTitle?: string
}

export const SiteHeader = ({ sectionTitle }: SiteHeaderProps) => {
    const { teams } = useTeams()

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear z-40 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pr-4">
            <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 h-4" />
                <div className="flex flex-col justify-center">
                    <DynamicBreadcrumbs />
                    {sectionTitle && (
                        <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-70">{sectionTitle}</h1>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <AppSwitcher teams={teams} />
            </div>
        </header>
    )
}

