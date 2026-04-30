"use client"

import { NaturalRegion } from "@/types/fonoteca";
import { useRouter, useSearchParams } from "next/navigation";

export function EcosystemFilters({ regions }: { regions: NaturalRegion[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRegionId = searchParams.get("region_id") || "";

  const handleRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("region_id", value);
    } else {
      params.delete("region_id");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-w-[200px]"
      value={currentRegionId}
      onChange={(e) => handleRegionChange(e.target.value)}
    >
      <option value="">Todas las regiones</option>
      {regions.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
