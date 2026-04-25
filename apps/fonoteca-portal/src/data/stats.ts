import { supabase } from "../lib/supabase";

export async function getRealStats() {
    try {
        // 1. Total Occurrences with Audio (Recordings)
        // We count occurrences that have at least one multimedia record of type 'Sound'
        const { count: recordingsCount, error: recordingsError } = await supabase
            .from('occurrences')
            .select('id, multimedia!inner(id)', { count: 'exact', head: true })
            .eq('multimedia.type', 'Sound');

        // 2. Total Species (Unique Taxa)
        // Check if we have unique taxa in the 'taxa' table
        const { count: speciesCount, error: speciesError } = await supabase
            .from('taxa')
            .select('*', { count: 'exact', head: true });

        // 3. Total Families (Unique Families)
        const { count: familiesCount, error: familiesError } = await supabase
            .from('families')
            .select('*', { count: 'exact', head: true });

        if (recordingsError || speciesError || familiesError) {
            console.error("Supabase Query Error:", { recordingsError, speciesError, familiesError });
            // Fallback to simpler queries if requested relation fails
            const { count: multimediaCount } = await supabase
                .from('multimedia')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'Sound');

            return {
                recordings: (recordingsCount !== null ? recordingsCount : multimediaCount) || 0,
                species: speciesCount || 0,
                families: familiesCount || 0
            };
        }

        console.log("Stats successfully fetched from Supabase:", { recordingsCount, speciesCount, familiesCount });

        return {
            recordings: recordingsCount || 0,
            species: speciesCount || 0,
            families: familiesCount || 0
        };
    } catch (err) {
        console.error("Critical error in getRealStats:", err);
        return { recordings: 0, species: 0, families: 0 };
    }
}

export async function getSpeciesByClass() {
    // Fetch all unique classes from the database
    const { data: taxa, error } = await supabase
        .from('taxa')
        .select('genus:genera!inner(family:families!inner(class))') as { data: any[] | null, error: any };

    if (error || !taxa) {
        console.error("Error fetching unique classes:", error);
        return [];
    }

    const uniqueClasses = Array.from(new Set(taxa.map(t => t.genus?.family?.class).filter(Boolean)));

    const classMapping: Record<string, { es: string, en: string, pt: string, icon: string }> = {
        'Amphibia': { es: 'Anfibios', en: 'Amphibians', pt: 'Anfíbios', icon: '🐸' },
        'Aves': { es: 'Aves', en: 'Birds', pt: 'Aves', icon: '🐦' },
        'Mammalia': { es: 'Mamíferos', en: 'Mammals', pt: 'Mamíferos', icon: '🦇' },
        'Insecta': { es: 'Grillos', en: 'Crickets', pt: 'Grilos', icon: '🦗' },
        'Reptilia': { es: 'Reptiles', en: 'Reptiles', pt: 'Répteis', icon: '🐍' },
        'Actinopterygii': { es: 'Peces', en: 'Fish', pt: 'Peixes', icon: '🐟' },
    };

    const results = await Promise.all(uniqueClasses.map(async (clsId) => {
        const { count, error: countError } = await supabase
            .from('taxa')
            .select('*, genus:genera!inner(family:families!inner(class))', { count: 'exact', head: true })
            .eq('genus.family.class', clsId);

        const mapping = classMapping[clsId] || { es: clsId, en: clsId, pt: clsId, icon: '🐾' };

        return {
            id: clsId,
            title_es: mapping.es,
            title_en: mapping.en,
            title_pt: mapping.pt,
            icon: mapping.icon,
            count: count || 0
        };
    }));

    return results;
}
