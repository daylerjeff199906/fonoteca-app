import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_FONOTECA_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_FONOTECA_SUPABASE_ANON_KEY;

export const createFonotecaClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
    );
