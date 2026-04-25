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
  const hasImage = typeof params.hasImage === "string" ? params.hasImage : "all";
  const hasAudio = typeof params.hasAudio === "string" ? params.hasAudio : "all";

  const [{ data: occurrences, count, error }, { data: taxa }] = await Promise.all([
    getOccurrences({
      page,
      limit,
      search,
      taxonId,
      hasImage,
      hasAudio,
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


