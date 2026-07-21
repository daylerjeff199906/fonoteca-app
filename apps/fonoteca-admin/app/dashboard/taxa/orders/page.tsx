import { getOrdersPaginated } from "@/actions/orders";
import { getAllClasses } from "@/actions/classes";
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
  const class_id = typeof params.class_id === "string" ? params.class_id : "";

  const [{ data, count }, classes] = await Promise.all([getOrdersPaginated({
    page,
    limit,
    search,
    class_id,
  }), getAllClasses()]);

  return (
    <LayoutWrapper sectionTitle="Taxonomía - Órdenes">
      <OrdersClient data={data} count={count} classes={classes.data || []} />
    </LayoutWrapper>
  );
}
