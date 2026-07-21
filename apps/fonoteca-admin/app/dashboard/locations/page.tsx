import { getLocations } from "@/actions/locations";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { Plus } from "lucide-react";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { LocationsClient } from "@/components/dashboard/locations/locations-client";

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

      <LocationsClient data={locations} />

      <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}

