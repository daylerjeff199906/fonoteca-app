import { getFamiliesPaginated } from "@/actions/families";
import { FamiliesClient } from "@/components/dashboard/taxa/families/families-client";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function FamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  const { data, count } = await getFamiliesPaginated({
    page,
    limit,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Familias">
      <FamiliesClient data={data} count={count} />
    </LayoutWrapper>
  );
}
