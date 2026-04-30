import { getNaturalRegions, deleteNaturalRegion } from "@/actions/natural-regions";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Globe, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function NaturalRegionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";

  const { data: regions, count, error } = await getNaturalRegions({
    page,
    limit: 10,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="space-y-4">
        <PageHeader
          title="Regiones Naturales"
          description="Nivel macro de ecosistemas y biomas."
          action={{
            label: "Añadir Región",
            href: "/dashboard/geography/natural-regions/create",
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <SearchInput placeholder="Buscar por nombre..." />
        </div>

        {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.length > 0 ? (
                regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={region.logo_url || ""} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          <Globe className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {region.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground line-clamp-2 max-w-[500px]">
                      {region.description || "Sin descripción"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/geography/natural-regions/${region.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteButtonWithConfirm 
                          id={region.id} 
                          onConfirm={deleteNaturalRegion} 
                          itemName="región natural" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground text-sm">
                    No se encontraron regiones naturales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}
