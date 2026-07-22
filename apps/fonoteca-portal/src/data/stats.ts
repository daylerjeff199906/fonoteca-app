import { fetchApi } from "../lib/api";

interface PaginatedResponse {
  meta?: {
    totalItems: number;
  };
}

export async function getRealStats() {
  try {
    const [multimediaRes, taxaRes, familiesRes, ordersRes, classesRes] = await Promise.allSettled([
      fetchApi<PaginatedResponse>("/multimedia?limit=1"),
      fetchApi<PaginatedResponse>("/taxa?limit=1"),
      fetchApi<PaginatedResponse>("/families?limit=1"),
      fetchApi<PaginatedResponse>("/orders?limit=1"),
      fetchApi<PaginatedResponse>("/classes?limit=1"),
    ]);

    const getValue = (res: PromiseSettledResult<PaginatedResponse>): number => {
      if (res.status === "fulfilled" && res.value?.meta?.totalItems !== undefined) {
        return res.value.meta.totalItems;
      }
      return 0;
    };

    return {
      recordings: getValue(multimediaRes),
      species: getValue(taxaRes),
      families: getValue(familiesRes),
      orders: getValue(ordersRes),
      classes: getValue(classesRes),
    };
  } catch (err) {
    console.error("Error in getRealStats:", err);
    return { recordings: 0, species: 0, families: 0, orders: 0, classes: 0 };
  }
}

export async function getSpeciesByClass() {
  try {
    const classes = await fetchApi<any[]>("/classes");
    if (!Array.isArray(classes)) return [];

    return classes.map((cls) => ({
      id: cls.name,
      label_name: cls.label_name || cls.name,
      icon: cls.icon || null,
      count: cls._count?.taxa ?? 0,
      image_url: cls.image_url || null,
    }));
  } catch (err) {
    console.error("Error fetching species by class:", err);
    return [];
  }
}
