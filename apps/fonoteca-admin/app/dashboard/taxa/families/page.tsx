import { getFamiliesPaginated } from "@/actions/families";
import { getAllOrders } from "@/actions/orders";
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
  const order_id = typeof params.order_id === "string" ? params.order_id : "";

  const [{ data, count }, orders] = await Promise.all([getFamiliesPaginated({
    page,
    limit,
    search,
    order_id,
  }), getAllOrders()]);

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Familias">
      <FamiliesClient data={data} count={count} orders={orders.data || []} />
    </LayoutWrapper>
  );
}
