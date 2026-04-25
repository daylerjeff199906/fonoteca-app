import { BulkUploadSheet } from "@/components/dashboard/occurrences/bulk-upload-sheet"
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper"
import { PageHeader } from "@/components/panel-admin/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface ProfileLayoutProps {
    children: React.ReactNode
}

export default async function ProfileLayout({
    children,
}: ProfileLayoutProps) {



    return (
        <LayoutWrapper
            sectionTitle="Informacion de ocurrencias"
        >
            <PageHeader
                title="Ocurrencias"
                description="Gestión de monitoreo de especies avistadas."
            >
                <BulkUploadSheet />
                <Button
                    size="sm"
                    className="h-8 text-xs flex items-center gap-1"
                    asChild
                >
                    <Link href="/dashboard/occurrences/create">
                        <Plus className="h-4 w-4" />
                        <span>Registrar Ocurrencia</span>
                    </Link>
                </Button>
            </PageHeader>
            {children}
        </LayoutWrapper>
    )
}
