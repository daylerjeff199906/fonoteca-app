import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_BIO_INTRANET_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_BIO_INTRANET_SUPABASE_ANON_KEY;

export const createBioIntranetClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKey!,
    );
