import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jljqwtrcytyuvsackdkm.supabase.co";
const supabaseKey = "sb_publishable_dW-FSQV3swUQ27xCncfgow_VvPSo77G";

const supabase = createClient(supabaseUrl, supabaseKey);

async function printClasses() {
    const { data, error } = await supabase
        .from('classes')
        .select('name, label_name');
    console.log("Classes data:", JSON.stringify(data, null, 2), "Error:", error);
}

printClasses();
