import { getEvents } from "@/actions/events";
import { EventsClient } from "@/components/dashboard/events";
import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";

  const { data, count, error } = await getEvents({
    page,
    limit,
    search,
  });

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <LayoutWrapper sectionTitle="Eventos de Muestreo">
      <EventsClient data={data} count={count} />
    </LayoutWrapper>
  );
}
