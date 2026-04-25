import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_BIO_INTRANET_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_BIO_INTRANET_SUPABASE_ANON_KEY;

export const createBioIntranetServer = async (cookieStore: Awaited<ReturnType<typeof cookies>>, host?: string) => {
    const isProd = host?.includes('iiap.gob.pe') ?? false;

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
                            const cookieOptions = { ...options };
                            if (isProd) {
                                cookieOptions.domain = '.iiap.gob.pe';
                            }
                            cookieStore.set(name, value, cookieOptions);
                        });
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
            cookieOptions: isProd ? { domain: '.iiap.gob.pe' } : undefined,
        },
    );
};
