import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jljqwtrcytyuvsackdkm.supabase.co";
const supabaseKey = "sb_publishable_dW-FSQV3swUQ27xCncfgow_VvPSo77G";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
    console.log("Testing occurrences query...");
    const { count: recordingsCount, error: recordingsError } = await supabase
        .from('occurrences')
        .select('id, multimedia!inner(id)', { count: 'exact', head: true })
        .eq('multimedia.type', 'Sound');
    console.log("Occurrences sound count:", recordingsCount, "Error:", recordingsError);

    console.log("Testing classes query...");
    const { count: classesCount, error: classesError } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });
    console.log("Classes count:", classesCount, "Error:", classesError);

    console.log("Testing orders query...");
    const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
    console.log("Orders count:", ordersCount, "Error:", ordersError);

    console.log("Testing taxa query...");
    const { count: taxaCount, error: taxaError } = await supabase
        .from('taxa')
        .select('*', { count: 'exact', head: true });
    console.log("Taxa count:", taxaCount, "Error:", taxaError);

    console.log("Testing families query...");
    const { count: familiesCount, error: familiesError } = await supabase
        .from('families')
        .select('*', { count: 'exact', head: true });
    console.log("Families count:", familiesCount, "Error:", familiesError);
}

testQueries();
