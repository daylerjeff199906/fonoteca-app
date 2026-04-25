import { getGeneraPaginated } from "@/actions/genera";
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

  const { data, count } = await getGeneraPaginated({
    page,
    limit,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Géneros">
      <GeneraClient data={data} count={count} />
    </LayoutWrapper>
  );
}
