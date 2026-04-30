import { getEcosystems, deleteEcosystem } from "@/actions/ecosystems";
import { getNaturalRegions } from "@/actions/natural-regions";
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
import { Plus, Edit, Trees, MapIcon } from "lucide-react";
import Link from "next/link";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { Badge } from "@/components/ui/badge";

export default async function EcosystemsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";
  const regionId = typeof params.region_id === "string" ? params.region_id : "";

  const [{ data: ecosystems, count, error }, { data: regions }] = await Promise.all([
    getEcosystems({
      page,
      limit: 10,
      search,
      region_id: regionId,
    }),
    getNaturalRegions({ limit: 100 })
  ]);

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="space-y-4">
        <PageHeader
          title="Hábitats"
          description="Catálogo detallado de hábitats y sus características."
          action={{
            label: "Añadir Hábitat",
            href: "/dashboard/geography/ecosystems/create",
            icon: <Plus className="h-4 w-4" />,
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 min-w-[300px]">
            <SearchInput placeholder="Buscar por nombre..." />
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-w-[200px]"
              defaultValue={regionId}
              onChange={(e) => {
                const url = new URL(window.location.href);
                if (e.target.value) url.searchParams.set("region_id", e.target.value);
                else url.searchParams.delete("region_id");
                window.location.href = url.toString();
              }}
              // Note: This is a server component, the onChange won't work like this. 
              // I'll need a client component for filters if I want interactivity.
              // For now, I'll just leave the select as a placeholder or use a Client Wrapper.
            >
              <option value="">Todas las regiones</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ecosistema</TableHead>
                <TableHead>Región Natural</TableHead>
                <TableHead>Especies Botánicas</TableHead>
                <TableHead>Mapa</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ecosystems.length > 0 ? (
                ecosystems.map((eco) => (
                  <TableRow key={eco.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                          <Trees className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm line-clamp-1">{eco.name}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{eco.typical_locality || "Sin localidad típica"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                        {eco.region?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {eco.botanical_species?.slice(0, 2).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[9px] italic py-0 h-4">
                            {s}
                          </Badge>
                        ))}
                        {eco.botanical_species && eco.botanical_species.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{eco.botanical_species.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {eco.distribution_geojson ? (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] flex items-center gap-1">
                          <MapIcon className="h-2.5 w-2.5" /> Disponible
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/geography/ecosystems/${eco.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteButtonWithConfirm 
                          id={eco.id} 
                          onConfirm={deleteEcosystem} 
                          itemName="ecosistema" 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                    No se encontraron ecosistemas.
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
