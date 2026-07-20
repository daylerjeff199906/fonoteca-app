import { getGeneraPaginated } from "@/actions/genera";
import { getFamilies } from "@/actions/taxa";
import { GeneraClient } from "@/components/dashboard/taxa/genera/genera-client";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function GeneraPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";
  const family_id = typeof params.family_id === "string" ? params.family_id : "";

  const [{ data, count }, families] = await Promise.all([getGeneraPaginated({
    page,
    limit,
    search,
    family_id,
  }), getFamilies()]);

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Géneros">
      <GeneraClient data={data} count={count} families={families.data || []} />
    </LayoutWrapper>
  );
}
