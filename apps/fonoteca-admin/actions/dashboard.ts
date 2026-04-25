"use server";

import { createFonotecaServer } from "@/utils/supabase/fonoteca/server";
import { cookies } from "next/headers";

export async function getDashboardStats() {
  const cookieStore = await cookies();
  const supabase = await createFonotecaServer(cookieStore);

  try {
    const [
      { count: speciesCount },
      { count: occurrencesCount },
      { count: multimediaCount },
      { count: soundsCount },
      { count: generaCount }
    ] = await Promise.all([
      supabase.from("taxa").select("id", { count: "exact", head: true }),
      supabase.from("occurrences").select("id", { count: "exact", head: true }),
      supabase.from("multimedia").select("id", { count: "exact", head: true }),
      supabase.from("multimedia").select("id", { count: "exact", head: true }).eq("type", "Sound"),
      supabase.from("genera").select("id", { count: "exact", head: true })
    ]);

    // Fetch recent 5 occurrences with species names
    const { data: recentOccurrences } = await supabase
      .from("occurrences")
      .select("*, taxa(scientificName)")
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch for top charts comparison setup (e.g. 100 items)
    const { data: chartData } = await supabase
      .from("occurrences")
      .select("taxa(scientificName)")
      .limit(100);

    return {
      kpi: {
        species: speciesCount || 0,
        occurrences: occurrencesCount || 0,
        multimedia: multimediaCount || 0,
        sounds: soundsCount || 0,
        genera: generaCount || 0,
      },
      recentOccurrences: recentOccurrences || [],
      speciesStats: Object.entries(
        (chartData || []).reduce((acc: any, curr: any) => {
          const name = curr.taxa?.scientificName || "Desconocida";
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, count]: any) => ({ name, count }))
       .sort((a, b) => b.count - a.count)
       .slice(0, 5) // Top 5
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      kpi: { species: 0, occurrences: 0, multimedia: 0, sounds: 0, genera: 0 },
      recentOccurrences: []
    };
  }
}
