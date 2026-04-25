import { getLocations, deleteLocation } from "@/actions/locations";
import { DeleteButtonWithConfirm } from "@/components/dashboard/delete-button-with-confirm";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === "string" ? params.search : "";

  const { data: locations, count, error } = await getLocations({
    page,
    limit: 10,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Geografía">
      <div className="space-y-4">
        <PageHeader
          title="Ubicaciones"
          description="Gestión de lugares para las ocurrencias monitoreadas."
          action={{
            label: "Registrar Ubicación",
            href: "/dashboard/locations/create",
            icon: <Plus className="h-4 w-4" />,
          }}
        />


      <div className="flex items-center justify-between gap-4">
        <SearchInput placeholder="Buscar por localidad, provincia, etc." />
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Localidad</TableHead>
              <TableHead>Estado/Provincia</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length > 0 ? (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.locality}</TableCell>
                  <TableCell>{loc.stateProvince || "-"}</TableCell>
                  <TableCell>{loc.country}</TableCell>
                  <TableCell>
                    {loc.decimalLatitude && loc.decimalLongitude
                      ? `${loc.decimalLatitude}, ${loc.decimalLongitude}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/locations/${loc.id}/edit`} className={buttonVariants({ variant: "ghost", size: "icon" })} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteButtonWithConfirm 
                        id={loc.id} 
                        onConfirm={deleteLocation} 
                        itemName="lugar / ubicación" 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron resultados.
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

