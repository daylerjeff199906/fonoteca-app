import { supabase } from "../lib/supabase";

export async function getRealStats() {
    try {
        // 1. Total Occurrences with Audio (Recordings)
        const { count: recordingsCount, error: recordingsError } = await supabase
            .from('occurrences')
            .select('id, multimedia!inner(id)', { count: 'exact', head: true })
            .eq('multimedia.type', 'Sound');

        // 2. Total Species (Unique Taxa)
        const { count: speciesCount, error: speciesError } = await supabase
            .from('taxa')
            .select('*', { count: 'exact', head: true });

        // 3. Total Families
        const { count: familiesCount, error: familiesError } = await supabase
            .from('families')
            .select('*', { count: 'exact', head: true });

        // 4. Total Orders
        const { count: ordersCount, error: ordersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        // 5. Total Classes
        const { count: classesCount, error: classesError } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true });

        if (recordingsError || speciesError || familiesError || ordersError || classesError) {
            console.error("Supabase Query Error:", { recordingsError, speciesError, familiesError, ordersError, classesError });
            
            const { count: multimediaCount } = await supabase
                .from('multimedia')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'Sound');

            return {
                recordings: (recordingsCount !== null ? recordingsCount : multimediaCount) || 0,
                species: speciesCount || 0,
                families: familiesCount || 0,
                orders: ordersCount || 0,
                classes: classesCount || 0
            };
        }

        return {
            recordings: recordingsCount || 0,
            species: speciesCount || 0,
            families: familiesCount || 0,
            orders: ordersCount || 0,
            classes: classesCount || 0
        };
    } catch (err) {
        console.error("Critical error in getRealStats:", err);
        return { recordings: 0, species: 0, families: 0, orders: 0, classes: 0 };
    }
}

export async function getSpeciesByClass() {
    // Fetch all classes and count species for each
    interface NestedTaxonomy {
        id: string;
        name: string;
        label_name: any;
        icon: string | null;
        orders: {
            families: {
                genera: {
                    taxa: {
                        id: string;
                    }[];
                }[];
            }[];
        }[];
    }

    const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
            id,
            name,
            label_name,
            icon,
            orders:orders (
                families:families (
                    genera:genera (
                        taxa:taxa (
                            id
                        )
                    )
                )
            )
        `) as { data: NestedTaxonomy[] | null, error: any };

    if (classesError || !classes) {
        console.error("Error fetching species by class:", classesError);
        return [];
    }

    const results = classes.map(cls => {
        // Flatten the nesting to count taxa
        let totalTaxa = 0;
        cls.orders?.forEach(order => {
            order.families?.forEach(family => {
                family.genera?.forEach(genus => {
                    totalTaxa += genus.taxa?.length || 0;
                });
            });
        });

        // Use database fields if available, otherwise fallback to name
        const label = cls.label_name || {};
        
        return {
            id: cls.name,
            title_es: label.es || cls.name,
            title_en: label.en || cls.name,
            title_pt: label.pt || cls.name,
            icon: cls.icon || '🐾', // Default emoji if icon is null
            count: totalTaxa
        };
    });

    return results;
}
