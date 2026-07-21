import { getEcosystems } from "@/actions/ecosystems";
import { getNaturalRegions } from "@/actions/natural-regions";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { Plus } from "lucide-react";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { EcosystemFilters } from "@/components/dashboard/geography/ecosystems/ecosystem-filters";
import { EcosystemsClient } from "@/components/dashboard/geography/ecosystems/ecosystems-client";

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
            <EcosystemFilters regions={regions || []} />
          </div>
        </div>

        {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}

        <EcosystemsClient data={ecosystems} />

        <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}
