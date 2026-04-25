export interface Multimedia {
    id: string;
    identifier: string;
    url: string;
    type: string;
    format: string;
    title: string | null;
    description: string | null;
    tag: string | null;
    parent_multimedia_id: string | null;
}

export interface SpeciesAudio extends Multimedia {
    spectrogramImage: string | null | undefined;
}

export type SpeciesCategory = 'Amphibians' | 'Birds' | 'Mammals' | 'Crickets' | 'Reptiles';

export interface Species {
    id: string;
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
    galleryImages: Multimedia[];
    spectrograms: Multimedia[];
    audios: SpeciesAudio[];
    mainImage: string;
    location: string;
    genus?: string;
    family?: string;
    order?: string;
    class_name?: string;
}
