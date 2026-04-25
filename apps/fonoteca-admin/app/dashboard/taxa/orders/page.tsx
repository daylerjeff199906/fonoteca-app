import { getOrdersPaginated } from "@/actions/orders";
import { OrdersClient } from "@/components/dashboard/taxa/orders/orders-client";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  const { data, count } = await getOrdersPaginated({
    page,
    limit,
    search,
  });

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Órdenes">
      <OrdersClient data={data} count={count} />
    </LayoutWrapper>
  );
}
