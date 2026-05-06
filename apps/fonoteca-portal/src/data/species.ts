// --- Database Interfaces (Supabase schema-aligned) ---

export interface DbMultimedia {
    id: string;
    identifier: string;
    type: string;
    format: string;
    title: string | null;
    description: string | null;
    tag: string | null;
    vocalization_type: string | null;
    background_species: string | null;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    parent_multimedia_id: string | null;
}

export interface DbLocation {
    id: string;
    locationID: string | null;
    locality: string;
    decimalLatitude: number | null;
    decimalLongitude: number | null;
    coordinateUncertaintyInMeters: number | null;
    created_at: string;
    district?: {
        name: string;
        province?: {
            name: string;
            department?: {
                name: string;
            }
        }
    }
}

export interface DbClass {
    name: string;
    kingdom: string;
    phylum: string | null;
}

export interface DbOrder {
    name: string;
    classes: DbClass;
}

export interface DbFamily {
    name: string;
    orders: DbOrder;
}

export interface DbGenus {
    name: string;
    family: DbFamily;
}

export interface DbTaxon {
    scientificName: string;
    vernacularName: string | null;
    genus: DbGenus;
}

export interface DbOccurrence {
    id: string;
    occurrenceID: string;
    taxon_id: string;
    location_id: string;
    basisOfRecord: string;
    catalogNumber: string | null;
    institutions?: {
        name: string | null;
        code: string | null;
    };
    collections?: {
        name: string | null;
        code: string | null;
    };
    recordedBy: string;
    identifiedBy: string | null;
    lifeStage: string | null;
    sex: string | null;
    record_status: "draft" | "published" | "deleted";
    occurrence_date: string | null;
    temperature_c: number | null;
    relative_humidity_percent: number | null;
    elevation_masl: number | null;
    occurrenceRemarks: string | null;
    microhabitat_remarks: string | null;
    identificationMethod: string | null;
    events?: {
        eventDate: string;
        eventTime: string | null;
        samplingProtocol: string | null;
    };
    taxa: DbTaxon;
    locations: DbLocation;
    multimedia: DbMultimedia[];
    ecosystems?: {
        name: string;
        region?: {
            name: string;
        }
    }
}

export interface Multimedia {
    id: string;
    identifier: string;
    url: string; // Formatted URL for display
    type: string;
    format: string;
    title: string | null;
    description: string | null;
    tag: string | null;
    vocalization_type: string | null;
    background_species: string | null;
    duration_seconds: number | null;
    file_size_bytes: number | null;
    parent_multimedia_id: string | null;
}

export interface SpeciesAudio extends Multimedia {
    spectrogramImage: string | null | undefined; // URL of associated spectrogram
}

export type SpeciesCategory = 'Amphibians' | 'Birds' | 'Mammals' | 'Crickets' | 'Reptiles';

export interface Species {
    id: string; // Slug for URL
    scientificName: string;
    commonName_es: string;
    commonName_en: string;
    commonName_pt: string;
    category: SpeciesCategory;
    description: {
        es: string;
        en: string;
        pt: string;
    };
    characteristics?: {
        es: string[];
        en: string[];
        pt: string[];
    };
    galleryImages: Multimedia[];
    spectrograms: Multimedia[];
    audios: SpeciesAudio[]; // List of audios
    mainImage: string; // Principal image for preview
    location: string;
    genus?: string;
    family?: string;
    order?: string;
    class_name?: string;
    kingdom?: string;
    phylum?: string;
    databaseDetails?: {
        occurrenceID: string | null;
        basisOfRecord: string | null;
        institutionCode: string | null;
        institutionName: string | null;
        collectionCode: string | null;
        collectionName: string | null;
        catalogNumber: string | null;
        eventDate: string | null;
        eventTime: string | null;
        lifeStage: string | null;
        sex: string | null;
        identifiedBy: string | null;
        continent: string | null;
        country: string | null;
        stateProvince: string | null;
        province: string | null;
        district: string | null;
        locality: string | null;
        decimalLatitude: number | null;
        decimalLongitude: number | null;
        elevation: number | null;
        record_status: string | null;
        occurrence_date: string | null;
        temperature_c: number | null;
        relative_humidity_percent: number | null;
        elevation_masl: number | null;
        occurrenceRemarks: string | null;
        identificationMethod: string | null;
        samplingProtocol: string | null;
        ecosystem_name: string | null;
        microhabitat_remarks: string | null;
    };
}

export interface SpeciesFilterOptions {
    searchTerm?: string;
    location?: string;
    className?: string;
    order?: string;
    family?: string;
    genus?: string;
    onlyWithAudio?: boolean;
    page?: number;
    limit?: number;
}

// --- Helpers ---
export const formatMediaUrl = (identifier: string, isAudio: boolean = false) => {
    if (!identifier) return "";

    // Skip folders
    if (identifier.includes('drive.google.com/drive/u/0/folders/') || identifier.includes('/folders/')) {
        return "";
    }

    // Google Drive direct link patterns
    if (identifier.includes('drive.google.com')) {
        let fileId = "";
        const idMatch = identifier.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const queryMatch = identifier.match(/[?&]id=([a-zA-Z0-9_-]+)/);

        if (idMatch && idMatch[1]) fileId = idMatch[1];
        else if (queryMatch && queryMatch[1]) fileId = queryMatch[1];

        if (fileId) {
            if (isAudio) {
                // docs.google.com/uc works better for audio streaming in Wavesurfer
                return `https://docs.google.com/uc?export=download&id=${fileId}`;
            }
            // Use Google Drive thumbnail endpoint to avoid 403 Forbidden errors with lh3
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
    }

    return identifier;
};

import { supabase } from "../lib/supabase";

export async function getAllSpecies(options: SpeciesFilterOptions = {}): Promise<{ species: Species[], totalCount: number }> {
    const {
        searchTerm,
        location,
        className,
        order,
        family,
        genus,
        onlyWithAudio,
        page = 1,
        limit = 20
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    // Base query for counting AND fetching
    const multimediaJoin = onlyWithAudio ? '!inner' : '';

    let query = supabase
        .from("occurrences")
        .select(`
            id,
            occurrenceID,
            taxon_id,
            location_id,
            record_status,
            occurrence_date,
            temperature_c,
            relative_humidity_percent,
            elevation_masl,
            occurrenceRemarks,
            identificationMethod,
            microhabitat_remarks,
            basisOfRecord,
            catalogNumber,
            institutions (
                name,
                code
            ),
            collections (
                name,
                code
            ),
            taxa!inner (
                scientificName,
                vernacularName,
                genus:genera!inner (
                    name,
                    family:families!inner (
                        name,
                        orders:orders!inner (
                            name,
                            classes:classes!inner (
                                name,
                                kingdom,
                                phylum
                            )
                        )
                    )
                )
            ),
            locations!inner (*),
            events (
                eventDate,
                eventTime,
                samplingProtocol
            ),
            ecosystems (
                name,
                region:natural_regions (
                    name
                )
            ),
            multimedia${multimediaJoin}(
                id,
                identifier,
                type,
                format,
                title,
                description,
                tag,
                vocalization_type,
                background_species,
                duration_seconds,
                file_size_bytes,
                parent_multimedia_id
            )
        `, { count: 'exact' })
        .eq('record_status', 'published');


    // 1. Search filter
    if (searchTerm) {
        query = query.or(`scientificName.ilike.%${searchTerm}%,vernacularName.ilike.%${searchTerm}%`, { foreignTable: 'taxa' });
    }

    // 2. Taxonomic filters (Category was mapped to class, now we use class directly)
    if (className && className !== 'All') {
        query = query.eq('taxa.genus.family.orders.classes.name', className);
    }

    if (order && order !== 'All') {
        query = query.eq('taxa.genus.family.orders.name', order);
    }

    if (family && family !== 'All') {
        query = query.eq('taxa.genus.family.name', family);
    }

    if (genus && genus !== 'All') {
        query = query.eq('taxa.genus.name', genus);
    }

    // 3. Location filter
    if (location && location !== 'All') {
        query = query.eq('locations.locality', location);
    }

    // 4. Audio filter (Backend via inner join)
    // if (onlyWithAudio) {
    //     query = query.eq('multimedia.type', 'Sound');
    // }

    // 5. Pagination
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: occurrences, error, count } = await query as { data: DbOccurrence[] | null, error: any, count: number | null };
    if (error) {
        console.error("Error fetching species from Supabase:", error);
        return { species: [], totalCount: 0 };
    }

    const speciesList: Species[] = (occurrences || []).map((occ) => {
        const taxon = occ.taxa;
        const loc = occ.locations;
        const media = occ.multimedia || [];

        const isImage = (m: DbMultimedia): boolean => !!(m.type === 'Still' || m.format?.includes('image'));
        const isAudio = (m: DbMultimedia): boolean => !!(m.type === 'Sound' || m.format?.includes('audio'));

        const createMultimedia = (m: DbMultimedia): Multimedia => {
            const url = formatMediaUrl(m.identifier, isAudio(m));
            return {
                id: m.id,
                identifier: m.identifier,
                url: url,
                type: m.type,
                format: m.format,
                title: m.title,
                description: m.description,
                tag: m.tag,
                vocalization_type: m.vocalization_type,
                background_species: m.background_species,
                duration_seconds: m.duration_seconds,
                file_size_bytes: m.file_size_bytes,
                parent_multimedia_id: m.parent_multimedia_id
            };
        };

        const photos = media
            .filter((m) => isImage(m) && (m.type === 'Still') && m.tag !== 'spectrogram')
            .map(createMultimedia)
            .filter((m) => m.identifier !== "");

        const spectrogramsList = media
            .filter((m) => isImage(m) && (m.type === 'Still') && m.tag === 'spectrogram')
            .map(createMultimedia)
            .filter((m) => m.identifier !== "");

        const audios: SpeciesAudio[] = media
            .filter(isAudio)
            .map((m): SpeciesAudio | null => {
                const multim = createMultimedia(m);
                if (multim.url === "") return null;

                const spectrogram = spectrogramsList.find(
                    (s) => s.parent_multimedia_id === m.id || (s.title && m.title && s.title.includes(m.title))
                );

                return {
                    ...multim,
                    spectrogramImage: spectrogram ? spectrogram.url : undefined,
                };
            })
            .filter((a): a is SpeciesAudio => a !== null);

        const classToCategory: Record<string, SpeciesCategory> = {
            'Amphibia': "Amphibians",
            'Aves': "Birds",
            'Mammalia': "Mammals",
            'Insecta': "Crickets",
            'Reptilia': "Reptiles",
        };

        const class_name = taxon?.genus?.family?.orders?.classes?.name || "";
        const cat = classToCategory[class_name] || "Amphibians";
        const commonName = taxon?.vernacularName || "Sin Nombre";

        const spectroUrl = spectrogramsList.length > 0 ? spectrogramsList[0].url : null;
        const photoUrl = photos.length > 0 ? photos[0].url : null;
        const fallbackUrl = '/images/logo-mini.webp';

        const imageToDisplay = onlyWithAudio
            ? (spectroUrl || photoUrl || fallbackUrl)
            : (photoUrl || spectroUrl || fallbackUrl);

        return {
            id: occ.id || "unknown",
            scientificName: taxon?.scientificName || "Unknown",
            commonName_es: commonName,
            commonName_en: commonName,
            commonName_pt: commonName,
            category: cat,
            description: {
                es: "Descripción del registro.",
                en: "Record description.",
                pt: "Descrição do registro.",
            },
            galleryImages: photos,
            spectrograms: spectrogramsList,
            audios: audios,
            mainImage: imageToDisplay,
            location: loc?.locality || "Unknown Location",
            genus: taxon?.genus?.name,
            family: taxon?.genus?.family?.name,
            order: taxon?.genus?.family?.orders?.name,
            class_name: taxon?.genus?.family?.orders?.classes?.name,
            kingdom: taxon?.genus?.family?.orders?.classes?.kingdom,
            phylum: taxon?.genus?.family?.orders?.classes?.phylum ?? undefined,
            databaseDetails: {
                occurrenceID: occ.occurrenceID,
                basisOfRecord: occ.basisOfRecord,
                institutionCode: occ.institutions?.code || null,
                institutionName: occ.institutions?.name || null,
                collectionCode: occ.collections?.code || null,
                collectionName: occ.collections?.name || null,
                catalogNumber: occ.catalogNumber,
                eventDate: occ.events?.eventDate || null,
                eventTime: occ.events?.eventTime || null,
                lifeStage: occ.lifeStage,
                sex: occ.sex,
                identifiedBy: occ.identifiedBy,
                continent: "South America",
                country: "Perú",
                stateProvince: loc?.district?.province?.department?.name || null,
                province: loc?.district?.province?.name || null,
                district: loc?.district?.name || null,
                locality: loc?.locality || null,
                decimalLatitude: loc?.decimalLatitude || null,
                decimalLongitude: loc?.decimalLongitude || null,
                elevation: null,
                record_status: occ.record_status,
                occurrence_date: occ.occurrence_date,
                temperature_c: occ.temperature_c,
                relative_humidity_percent: occ.relative_humidity_percent,
                elevation_masl: occ.elevation_masl,
                occurrenceRemarks: occ.occurrenceRemarks,
                microhabitat_remarks: occ.microhabitat_remarks,
                identificationMethod: occ.identificationMethod,
                samplingProtocol: occ.events?.samplingProtocol || null,
                ecosystem_name: occ.ecosystems?.name || null,
            }
        };
    });


    return {
        species: speciesList,
        totalCount: count || 0
    };
}

export async function getSpeciesById(id: string): Promise<Species | undefined> {
    const { data: occurrence, error } = await supabase
        .from('occurrences')
        .select(`
            id,
            occurrenceID,
            basisOfRecord,
            catalogNumber,
            institutions (
                name,
                code
            ),
            collections (
                name,
                code
            ),
            lifeStage,
            sex,
            identifiedBy,
            record_status,
            occurrence_date,
            temperature_c,
            relative_humidity_percent,
            elevation_masl,
            occurrenceRemarks,
            identificationMethod,
            microhabitat_remarks,
            events (
                eventDate,
                eventTime,
                samplingProtocol
            ),
            taxa:taxa!inner(
                scientificName,
                vernacularName,
                genus:genera!inner(
                    name,
                    family:families!inner(
                        name,
                        orders:orders!inner(
                            name,
                            classes:classes!inner(
                                name,
                                kingdom,
                                phylum
                            )
                        )
                    )
                )
            ),
            locations:locations!inner(
                locality,
                decimalLatitude,
                decimalLongitude,
                district:ubigeo_districts (
                    name,
                    province:ubigeo_provinces (
                        name,
                        department:ubigeo_departments (
                            name
                        )
                    )
                )
            ),
            ecosystems (
                name,
                region:natural_regions (
                    name
                )
            ),
            multimedia:multimedia(
                id,
                identifier,
                type,
                format,
                title,
                description,
                tag,
                vocalization_type,
                background_species,
                duration_seconds,
                file_size_bytes,
                parent_multimedia_id
            )
        `)
        .eq('id', id)
        .eq('record_status', 'published')
        .single() as { data: DbOccurrence | null, error: any };

    console.log("Occurrence data:", occurrence);
    if (error) {
        console.error("Supabase Error in getSpeciesById:", error);
    }

    if (error || !occurrence) return undefined;

    const taxon = occurrence.taxa;
    const loc = occurrence.locations;
    const media = occurrence.multimedia || [];

    const isImage = (m: DbMultimedia): boolean => !!(m.type === 'Still' || m.format?.includes('image'));
    const isAudio = (m: DbMultimedia): boolean => !!(m.type === 'Sound' || m.format?.includes('audio'));

    const createMultimedia = (m: DbMultimedia): Multimedia => {
        const url = formatMediaUrl(m.identifier, isAudio(m));
        return {
            id: m.id,
            identifier: m.identifier,
            url: url,
            type: m.type,
            format: m.format,
            title: m.title,
            description: m.description,
            tag: m.tag,
            vocalization_type: m.vocalization_type,
            background_species: m.background_species,
            duration_seconds: m.duration_seconds,
            file_size_bytes: m.file_size_bytes,
            parent_multimedia_id: m.parent_multimedia_id
        };
    };

    const photos = media
        .filter((m) => isImage(m) && (m.type === 'Still') && m.tag !== 'spectrogram')
        .map(createMultimedia)
        .filter((m) => m.identifier !== "");

    const spectrogramsList = media
        .filter((m) => m.tag === 'spectrogram')
        .map(createMultimedia)
        .filter((m) => m.url !== "");

    const audios: SpeciesAudio[] = media
        .filter(isAudio)
        .map((m): SpeciesAudio | null => {
            const multim = createMultimedia(m);
            if (multim.url === "") return null;

            const spectrogram = spectrogramsList.find(
                (s) => s.parent_multimedia_id === m.id || (s.title && m.title && s.title.includes(m.title))
            );

            return {
                ...multim,
                spectrogramImage: spectrogram ? spectrogram.url : undefined,
            };
        })
        .filter((a): a is SpeciesAudio => a !== null);

    const classToCategory: Record<string, SpeciesCategory> = {
        'Amphibia': "Amphibians",
        'Aves': "Birds",
        'Mammalia': "Mammals",
        'Insecta': "Crickets",
        'Reptilia': "Reptiles",
    };

    const class_name = taxon?.genus?.family?.orders?.classes?.name || "";
    const cat = classToCategory[class_name] || "Amphibians";
    const commonName = taxon?.vernacularName || "Sin Nombre";

    const spectroUrl = spectrogramsList.length > 0 ? spectrogramsList[0].url : null;
    const photoUrl = photos.length > 0 ? photos[0].url : null;
    const fallbackUrl = '/images/logo-mini.webp';

    const imageToDisplay = photoUrl || spectroUrl || fallbackUrl;

    return {
        id: occurrence.id || "unknown",
        scientificName: taxon?.scientificName || "Unknown",
        commonName_es: commonName,
        commonName_en: commonName,
        commonName_pt: commonName,
        category: cat,
        description: {
            es: "Descripción del registro.",
            en: "Record description.",
            pt: "Descrição do registro.",
        },
        galleryImages: photos,
        spectrograms: spectrogramsList,
        audios: audios,
        mainImage: imageToDisplay,
        location: loc?.locality || "Unknown Location",
        genus: taxon?.genus?.name,
        family: taxon?.genus?.family?.name,
        order: taxon?.genus?.family?.orders?.name,
        class_name: taxon?.genus?.family?.orders?.classes?.name,
        kingdom: taxon?.genus?.family?.orders?.classes?.kingdom,
        phylum: taxon?.genus?.family?.orders?.classes?.phylum ?? undefined,
        databaseDetails: {
            occurrenceID: occurrence.occurrenceID,
            basisOfRecord: occurrence.basisOfRecord,
            institutionCode: occurrence.institutions?.code || null,
            institutionName: occurrence.institutions?.name || null,
            collectionCode: occurrence.collections?.code || null,
            collectionName: occurrence.collections?.name || null,
            catalogNumber: occurrence.catalogNumber,
            eventDate: occurrence.events?.eventDate || null,
            eventTime: occurrence.events?.eventTime || null,
            lifeStage: occurrence.lifeStage,
            sex: occurrence.sex,
            identifiedBy: occurrence.identifiedBy,
            continent: "South America",
            country: "Perú",
            stateProvince: loc?.district?.province?.department?.name || null,
            province: loc?.district?.province?.name || null,
            district: loc?.district?.name || null,
            locality: loc?.locality || null,
            decimalLatitude: loc?.decimalLatitude || null,
            decimalLongitude: loc?.decimalLongitude || null,
            elevation: null,
            record_status: occurrence.record_status,
            occurrence_date: occurrence.occurrence_date,
            temperature_c: occurrence.temperature_c,
            relative_humidity_percent: occurrence.relative_humidity_percent,
            elevation_masl: occurrence.elevation_masl,
            occurrenceRemarks: occurrence.occurrenceRemarks,
            microhabitat_remarks: occurrence.microhabitat_remarks,
            identificationMethod: occurrence.identificationMethod,
            samplingProtocol: occurrence.events?.samplingProtocol || null,
            ecosystem_name: occurrence.ecosystems?.name || null,
        }
    };
}

// Helper to fetch unique filter values directly from Supabase
export async function getFilterMetaData() {
    // We only want metadata from published occurrences
    const { data: occurrences } = await supabase
        .from('occurrences')
        .select(`
            record_status,
            taxa (
                scientificName, 
                vernacularName, 
                genus:genera (
                    name, 
                    family:families (
                        name, 
                        orders:orders (
                            name, 
                            classes:classes (
                                name
                            )
                        )
                    )
                )
            ),
            locations (
                locality
            )
        `)
        .eq('record_status', 'published') as { data: any[] | null };

    const taxa = occurrences?.map(o => o.taxa).filter(Boolean) || [];
    const locs = occurrences?.map(o => o.locations).filter(Boolean) || [];

    const taxonomyPaths = Array.from(new Set(taxa.map((t: any) => {
        const className = t.genus?.family?.orders?.classes?.name;
        const orderName = t.genus?.family?.orders?.name;
        const familyName = t.genus?.family?.name;
        const genusName = t.genus?.name;
        if (className || orderName || familyName || genusName) {
            return JSON.stringify({ class: className || null, order: orderName || null, family: familyName || null, genus: genusName || null });
        }
        return null;
    }).filter((t): t is string => Boolean(t)))).map((str) => JSON.parse(str));

    const classes = Array.from(new Set(taxonomyPaths.map((p: any) => p.class).filter(Boolean))).sort() as string[];
    const orders = Array.from(new Set(taxonomyPaths.map((p: any) => p.order).filter(Boolean))).sort() as string[];
    const families = Array.from(new Set(taxonomyPaths.map((p: any) => p.family).filter(Boolean))).sort() as string[];
    const genera = Array.from(new Set(taxonomyPaths.map((p: any) => p.genus).filter(Boolean))).sort() as string[];
    const localities = Array.from(new Set(locs?.map((l: any) => l.locality).filter(Boolean) as string[])).sort();

    return { classes, orders, families, genera, localities, taxonomyPaths };
}
