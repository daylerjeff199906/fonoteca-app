import { getClassesPaginated } from "@/actions/classes";
import { ClassesClient } from "@/components/dashboard/taxa/classes/classes-client";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  const { data, count } = await getClassesPaginated({
    page,
    limit,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Clases">
      <ClassesClient data={data} count={count} />
    </LayoutWrapper>
  );
}
