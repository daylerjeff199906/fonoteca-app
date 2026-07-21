import { getInstitutions } from "@/actions/institutions";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { SearchInput } from "@/components/dashboard/search-input";
import { Plus } from "lucide-react";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";
import { InstitutionsClient } from "@/components/dashboard/geography/institutions/institutions-client";

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

        <InstitutionsClient data={institutions} />

        <PaginationButtons totalCount={count} pageSize={10} />
      </div>
    </LayoutWrapper>
  );
}
