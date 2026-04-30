import { getInstitutions, deleteInstitution } from "@/actions/institutions";
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
import { Plus, Edit, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Badge } from "@/components/ui/badge";

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";

  const { data: institutions, count, error } = await getInstitutions({
    page,
    limit: 10,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="space-y-4">
        <PageHeader
          title="Instituciones"
          description="Gestión de instituciones, centros de investigación y fonotecas."
          action={{
            label: "Registrar Institución",
            href: "/dashboard/geography/institutions/create",
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <SearchInput placeholder="Buscar por nombre o código..." />
        </div>

        {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Institución</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ciudad / País</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.length > 0 ? (
                institutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm line-clamp-1">{inst.name}</span>
                          <span className="text-[10px] text-muted-foreground">{inst.email || "Sin email"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                        {inst.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{inst.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{inst.physical_address?.city || "N/A"}, {inst.physical_address?.country || "Peru"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {inst.is_active ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Activo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/geography/institutions/${inst.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteButtonWithConfirm 
                          id={inst.id} 
                          onConfirm={deleteInstitution} 
                          itemName="institución" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    No se encontraron instituciones registradas.
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
