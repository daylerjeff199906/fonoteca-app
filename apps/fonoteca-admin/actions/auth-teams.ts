import { fetchWithSession } from "@/lib/backend/auth";
import { headers } from "next/headers";

export interface TeamModule {
    name: string;
    logo: string;
    url: string;
    plan: string;
}

const MODULE_ASSETS: Record<string, { logo: string; plan: string; defaultUrl: string }> = {
    'intranet': {
        logo: '/brands/logo-iiap.webp',
        plan: 'Plataforma Core',
        defaultUrl: 'https://auth.iiap.gob.pe'
    },
    'coniap': {
        logo: '/brands/coniap.png',
        plan: 'Gestión de Eventos',
        defaultUrl: 'https://coniap.iiap.gob.pe'
    },
    'fonoteca': {
        logo: '/brands/fonoteca.png',
        plan: 'Administración',
        defaultUrl: '/'
    }
};

export async function getAuthorizedTeams(): Promise<TeamModule[]> {
    try {
        const headerList = await headers();
        const host = headerList.get('host') || '';
        const base = process.env.BACKEND_API_URL ?? "http://127.0.0.1:3000/api/v1";

        const res = await fetchWithSession(`${base.replace(/\/$/, "")}/auth/me`);
        if (!res.ok) return [];
        const user = await res.json();
        if (!user) return [];

        const modulesMap = new Map<string, TeamModule>();

        const addModule = (rawName: string, dbUrl?: string) => {
            const asset = MODULE_ASSETS[rawName.toLowerCase()] || {
                logo: '/brands/logo-iiap.webp',
                plan: 'Aplicativo',
                defaultUrl: dbUrl || '#'
            };
            modulesMap.set(rawName.toLowerCase(), {
                name: rawName.toUpperCase(),
                logo: asset.logo,
                url: dbUrl || asset.defaultUrl,
                plan: asset.plan
            });
        };

        // Standard default module for Fonoteca Admin
        addModule("fonoteca", "/");

        if (Array.isArray(user.modules)) {
            user.modules.forEach((mod: any) => {
                if (mod.name) addModule(mod.name, host.includes('localhost') ? mod.url_local : mod.url_prod);
            });
        }

        return Array.from(modulesMap.values());
    } catch (err) {
        console.error("Error fetching authorized teams:", err);
        return [];
    }
}
