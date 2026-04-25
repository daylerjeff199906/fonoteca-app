import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_FONOTECA_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_FONOTECA_SUPABASE_ANON_KEY;

export const createFonotecaServer = async (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // En esta base de datos Fonoteca no solemos persistir sesiones de Auth
                            // Dado que la sesión de admin se valida con bio-intranet.
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        },
    );
};
