"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { usePathname } from "next/navigation"

interface PageHeaderContextType {
    /** Título puesto por la página actual (solo si depende de un dato); null si no hay. */
    title: string | null
    setTitle: (title: string | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined)

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [override, setOverride] = useState<{ pathname: string; title: string } | null>(null)

    const setTitle = useCallback((newTitle: string | null) => {
        setOverride(newTitle ? { pathname, title: newTitle } : null)
    }, [pathname])

    // Un título puesto en otra ruta no se arrastra a la actual.
    const title = override && override.pathname === pathname ? override.title : null

    return (
        <PageHeaderContext.Provider value={{ title, setTitle }}>
            {children}
        </PageHeaderContext.Provider>
    )
}

export function usePageHeader() {
    const context = useContext(PageHeaderContext)
    if (context === undefined) {
        throw new Error("usePageHeader must be used within a PageHeaderProvider")
    }
    return context
}
