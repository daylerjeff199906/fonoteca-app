'use client'

interface LayoutWrapperProps {
    children: React.ReactNode
    sectionTitle?: string
}

export const LayoutWrapper = ({
    children,
    sectionTitle,
}: LayoutWrapperProps) => {

    return (
        <div className="flex flex-col gap-6">
            {sectionTitle && (
                <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{sectionTitle}</h2>
                </div>
            )}
            {children}
        </div>
    )
}
