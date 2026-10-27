import { getOccurrences } from "@/actions/occurrences";
import { getTaxa } from "@/actions/taxa";
import { OccurrencesClient } from "@/components/dashboard/occurrences/occurrences-client";

export default async function OccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = typeof params.search === "string" ? params.search : "";
  const taxonId = typeof params.taxonId === "string" ? params.taxonId : "";
  const basisOfRecord = typeof params.basisOfRecord === "string" ? params.basisOfRecord : "";
  const status = typeof params.status === "string" ? params.status : (typeof params.record_status === "string" ? params.record_status : "");

  const [{ data: occurrences, count, error }, { data: taxa }] = await Promise.all([
    getOccurrences({
      page,
      limit,
      search,
      taxonId,
      basisOfRecord,
      status,
    }),
    getTaxa({ limit: 1000 }) // Load all taxa for filtering
  ]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <OccurrencesClient
      data={occurrences}
      count={count}
      taxa={taxa || []}
    />
  );
}


