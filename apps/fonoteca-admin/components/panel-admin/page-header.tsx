import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
    title: string
    description?: string
    backUrl?: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
        icon?: React.ReactNode
    }
    children?: React.ReactNode
}

export function PageHeader({ title, description, backUrl, action, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
                {backUrl && (
                    <Button 
                        asChild
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full shadow-none border-muted/40" 
                    >
                        <Link href={backUrl}>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    </Button>
                )}
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {(action || children) && (
                <div className="flex items-center gap-2">
                    {children}
                    {action && action.href ? (
                        <Button
                            asChild
                            size="sm"
                            className="h-8 text-xs rounded-full"
                        >
                            <Link
                                href={action.href}
                                className="flex items-center gap-1"
                            >
                                {action.icon}
                                <span>{action.label}</span>
                            </Link>
                        </Button>
                    ) : action && action.onClick ? (
                        <Button
                            size="sm"
                            className="h-8 text-xs flex items-center gap-1 rounded-full"
                            onClick={action.onClick}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </Button>
                    ) : null}
                </div>
            )}
        </div>
    )
}

