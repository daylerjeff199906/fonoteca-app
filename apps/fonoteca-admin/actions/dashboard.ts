"use server";

import { getCrudPage } from "@/lib/backend/crud";

export async function getDashboardStats() {
  try {
    const [
      taxaRes,
      occurrencesRes,
      multimediaRes,
      generaRes,
      recentRes,
    ] = await Promise.allSettled([
      getCrudPage<any>("taxa", { page: 1, limit: 1 }),
      getCrudPage<any>("occurrences", { page: 1, limit: 1 }),
      getCrudPage<any>("multimedia", { page: 1, limit: 1 }),
      getCrudPage<any>("genera", { page: 1, limit: 1 }),
      getCrudPage<any>("occurrences", { page: 1, limit: 5 }),
    ]);

    const getTotal = (res: PromiseSettledResult<any>): number => {
      if (res.status === "fulfilled" && res.value?.meta?.totalItems !== undefined) {
        return res.value.meta.totalItems;
      }
      return 0;
    };

    const recentOccurrences = recentRes.status === "fulfilled" ? recentRes.value?.data || [] : [];

    const speciesStats = Object.entries(
      recentOccurrences.reduce((acc: Record<string, number>, curr: any) => {
        const name = curr.taxa?.scientificName || curr.taxon?.scientificName || "Desconocida";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      kpi: {
        species: getTotal(taxaRes),
        occurrences: getTotal(occurrencesRes),
        multimedia: getTotal(multimediaRes),
        sounds: getTotal(multimediaRes),
        genera: getTotal(generaRes),
      },
      recentOccurrences,
      speciesStats,
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      kpi: { species: 0, occurrences: 0, multimedia: 0, sounds: 0, genera: 0 },
      recentOccurrences: [],
      speciesStats: [],
    };
  }
}
