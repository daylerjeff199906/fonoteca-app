import { getNaturalRegions } from "@/actions/natural-regions";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { NaturalRegionsClient } from "@/components/dashboard/geography/natural-regions/natural-regions-client";

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
        <div className="flex items-center justify-between gap-4">
          <SearchInput placeholder="Buscar por nombre..." />
        </div>

        {error && <div className="text-red-500 bg-red-50 p-3 rounded-md text-sm">{error}</div>}

        <NaturalRegionsClient data={regions} />

        <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}
