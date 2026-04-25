"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Taxon } from "@/types/fonoteca";
import { Label } from "@/components/ui/label";

export function OccurrenceFilters({ taxa }: { taxa: Taxon[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <Label htmlFor="taxon" className="text-xs font-semibold uppercase text-muted-foreground">Taxón</Label>
        <Select
          value={searchParams.get("taxonId") || "all"}
          onValueChange={(v) => updateParams("taxonId", v)}
        >
          <SelectTrigger id="taxon" className="h-9">
            <SelectValue placeholder="Filtrar por Taxón" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Taxones</SelectItem>
            {taxa.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.scientificName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image" className="text-xs font-semibold uppercase text-muted-foreground">Imagen</Label>
        <Select
          value={searchParams.get("hasImage") || "all"}
          onValueChange={(v) => updateParams("hasImage", v)}
        >
          <SelectTrigger id="image" className="h-9 w-[140px]">
            <SelectValue placeholder="Imágenes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="yes">Con Imagen</SelectItem>
            <SelectItem value="no">Sin Imagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audio" className="text-xs font-semibold uppercase text-muted-foreground">Audio</Label>
        <Select
          value={searchParams.get("hasAudio") || "all"}
          onValueChange={(v) => updateParams("hasAudio", v)}
        >
          <SelectTrigger id="audio" className="h-9 w-[140px]">
            <SelectValue placeholder="Audios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Con Audio</SelectItem>
            <SelectItem value="no">Sin Audio</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
