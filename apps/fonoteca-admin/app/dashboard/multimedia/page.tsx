import { getMultimediaList } from "@/actions/multimedia";
import { PaginationButtons } from "@/components/dashboard/pagination-buttons";
import { MultimediaFilters } from "@/components/dashboard/multimedia/multimedia-filters";
import { MultimediaTable } from "@/components/dashboard/multimedia/multimedia-table";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/backend/auth";
import { canWriteMedia } from "@/lib/media-permissions";
import { routeLabel } from "@/config/route-labels";

import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { PageHeader } from "@/components/panel-admin/page-header";

const TYPE_FILTERS: Record<string, string> = { audio: "Sound", image: "Still" };

export default async function MultimediaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const typeParam = typeof params.type === "string" ? params.type : "";
  const search = typeof params.search === "string" ? params.search.trim() : "";

  const [user, { data: multimedia, count, error }] = await Promise.all([
    getCurrentUser(),
    getMultimediaList({ page, limit, type: TYPE_FILTERS[typeParam] ?? "", search }),
  ]);
  const canWrite = canWriteMedia(user);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <LayoutWrapper>
      <div className="space-y-4">
        <PageHeader
          title={routeLabel("/dashboard/multimedia")}
          description="Consulte, escuche y gestione los audios e imágenes asociados a las ocurrencias."
          action={
            canWrite
              ? { label: "Subir archivo", href: "/dashboard/multimedia/create", icon: <Plus className="h-4 w-4" /> }
              : undefined
          }
        />

        <MultimediaFilters />

        <MultimediaTable items={multimedia} canWrite={canWrite} hasFilters={Boolean(search || typeParam)} />

        <PaginationButtons totalCount={count} itemLabel="Archivos" />
      </div>
    </LayoutWrapper>
  );
}
