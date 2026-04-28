import { LayoutWrapper } from "@/components/panel-admin/layout-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LayoutWrapper sectionTitle="Cargando Detalle...">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border rounded-lg p-6 mt-4">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
