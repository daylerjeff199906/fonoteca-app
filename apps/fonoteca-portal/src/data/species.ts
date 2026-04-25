// --- Database Interfaces (Supabase schema-aligned) ---

export interface DbMultimedia {
    id: string;
    identifier: string;
    type: string;
    format: string;
    title: string | null;
    description: string | null;
    tag: string | null;
    parent_multimedia_id: string | null;
}

export interface DbLocation {
    id: string;
    locationID: string | null;
    continent: string | null;
    country: string | null;
    countryCode: string | null;
    stateProvince: string | null;
    county: string | null;
    locality: string;
    decimalLatitude: number | null;
    decimalLongitude: number | null;
    coordinateUncertaintyInMeters: number | null;
    elevation: number | null;
    elevationAccuracy: number | null;
    habitat: string | null;
    created_at: string;
}

export interface DbFamily {
    name: string;
    order: string;
    class: string;
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
    institutionCode: string | null;
    collectionCode: string | null;
    catalogNumber: string | null;
    recordedBy: string;
    identifiedBy: string | null;
    eventDate: string;
    eventTime: string | null;
    lifeStage: string | null;
    sex: string | null;
    taxa: DbTaxon;
    locations: DbLocation;
    multimedia: DbMultimedia[];
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
    databaseDetails?: {
        occurrenceID: string | null;
        basisOfRecord: string | null;
        institutionCode: string | null;
        collectionCode: string | null;
        catalogNumber: string | null;
        eventDate: string | null;
        eventTime: string | null;
        lifeStage: string | null;
        sex: string | null;
        identifiedBy: string | null;
        continent: string | null;
        country: string | null;
        stateProvince: string | null;
        locality: string | null;
        decimalLatitude: number | null;
        decimalLongitude: number | null;
        elevation: number | null;
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
            taxa!inner (
                scientificName,
                vernacularName,
                genus:genera!inner (
                    name,
                    family:families!inner (
                        name,
                        order,
                        class
                    )
                )
            ),
            locations!inner (*),
            multimedia${multimediaJoin}(*)
        `, { count: 'exact' });


    // 1. Search filter
    if (searchTerm) {
        query = query.or(`scientificName.ilike.%${searchTerm}%,vernacularName.ilike.%${searchTerm}%`, { foreignTable: 'taxa' });
    }

    // 2. Taxonomic filters (Category was mapped to class, now we use class directly)
    if (className && className !== 'All') {
        query = query.eq('taxa.genus.family.class', className);
    }

    if (order && order !== 'All') {
        query = query.eq('taxa.genus.family.order', order);
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

        const class_name = taxon?.genus?.family?.class || "";
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
            order: taxon?.genus?.family?.order,
            class_name: taxon?.genus?.family?.class,
            databaseDetails: {
                occurrenceID: occ.occurrenceID,
                basisOfRecord: occ.basisOfRecord,
                institutionCode: occ.institutionCode,
                collectionCode: occ.collectionCode,
                catalogNumber: occ.catalogNumber,
                eventDate: occ.eventDate,
                eventTime: occ.eventTime,
                lifeStage: occ.lifeStage,
                sex: occ.sex,
                identifiedBy: occ.identifiedBy,
                continent: loc?.continent || null,
                country: loc?.country || null,
                stateProvince: loc?.stateProvince || null,
                locality: loc?.locality || null,
                decimalLatitude: loc?.decimalLatitude || null,
                decimalLongitude: loc?.decimalLongitude || null,
                elevation: loc?.elevation || null,
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
            institutionCode,
            collectionCode,
            catalogNumber,
            eventDate,
            eventTime,
            lifeStage,
            sex,
            identifiedBy,
            taxa:taxa!inner(
                scientificName,
                vernacularName,
                genus:genera!inner(
                    name,
                    family:families!inner(
                        name,
                        order,
                        class
                    )
                )
            ),
            locations:locations!inner(
                continent,
                country,
                stateProvince,
                locality,
                decimalLatitude,
                decimalLongitude,
                elevation
            ),
            multimedia:multimedia(
                id,
                identifier,
                type,
                format,
                title,
                description,
                tag,
                parent_multimedia_id
            )
        `)
        .eq('id', id)
        .single() as { data: DbOccurrence | null, error: any };

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

    const class_name = taxon?.genus?.family?.class || "";
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
        order: taxon?.genus?.family?.order,
        class_name: taxon?.genus?.family?.class,
        databaseDetails: {
            occurrenceID: occurrence.occurrenceID,
            basisOfRecord: occurrence.basisOfRecord,
            institutionCode: occurrence.institutionCode,
            collectionCode: occurrence.collectionCode,
            catalogNumber: occurrence.catalogNumber,
            eventDate: occurrence.eventDate,
            eventTime: occurrence.eventTime,
            lifeStage: occurrence.lifeStage,
            sex: occurrence.sex,
            identifiedBy: occurrence.identifiedBy,
            continent: loc?.continent || null,
            country: loc?.country || null,
            stateProvince: loc?.stateProvince || null,
            locality: loc?.locality || null,
            decimalLatitude: loc?.decimalLatitude || null,
            decimalLongitude: loc?.decimalLongitude || null,
            elevation: loc?.elevation || null,
        }
    };
}

// Helper to fetch unique filter values directly from Supabase
export async function getFilterMetaData() {
    const { data: taxa } = await supabase
        .from('taxa')
        .select(`
            scientificName, 
            vernacularName, 
            genus:genera!inner(
                name, 
                family:families!inner(
                    name, 
                    order, 
                    class
                )
            )
        `) as { data: DbTaxon[] | null };

    const { data: locs } = await supabase.from('locations').select('locality') as { data: { locality: string }[] | null };

    const classes = Array.from(new Set(taxa?.map(t => t.genus?.family?.class).filter(Boolean) as string[])).sort();
    const orders = Array.from(new Set(taxa?.map(t => t.genus?.family?.order).filter(Boolean) as string[])).sort();
    const families = Array.from(new Set(taxa?.map(t => t.genus?.family?.name).filter(Boolean) as string[])).sort();
    const genera = Array.from(new Set(taxa?.map(t => t.genus?.name).filter(Boolean) as string[])).sort();
    const localities = Array.from(new Set(locs?.map(l => l.locality).filter(Boolean) as string[])).sort();

    return { classes, orders, families, genera, localities };
}
