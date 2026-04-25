'use client'

import { SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from './site-header'

interface LayoutWrapperProps {
    children: React.ReactNode
    sectionTitle?: string
}

export const LayoutWrapper = ({
    children,
    sectionTitle,
}: LayoutWrapperProps) => {

    return (
        <SidebarInset className="max-h-svh overflow-auto">
            <SiteHeader sectionTitle={sectionTitle} />
            <div className="p-4 flex flex-col gap-4">
                {children}
            </div>
            <footer className="p-4 md:p-6 text-xs text-muted-foreground text-center mt-auto">
                &copy; {new Date().getFullYear()} IIAP.{' '}
                {'Todos los derechos reservados.'}
            </footer>
        </SidebarInset>
    )
}
