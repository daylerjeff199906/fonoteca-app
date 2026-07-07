import { getAudioRequestsList } from "@/actions/audio-requests";
import { AudioRequestsClient } from "@/components/dashboard/audio-requests/audio-requests-client";

export default async function AudioRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = typeof params.status === "string" ? params.status : "";

  const { data: requests, count, error } = await getAudioRequestsList({
    page,
    limit: 10,
    status,
  });

  if (error) {
    return <div className="p-4 text-red-500 font-semibold">Error al cargar solicitudes: {error}</div>;
  }

  return (
    <AudioRequestsClient
      initialRequests={requests}
      initialCount={count || 0}
      initialPage={page}
    />
  );
}
