export interface UbigeoDepartment {
  id: string;
  name: string;
}

export interface UbigeoProvince {
  id: string;
  department_id: string;
  name: string;
  department?: UbigeoDepartment;
}

export interface UbigeoDistrict {
  id: string;
  province_id: string;
  name: string;
  province?: UbigeoProvince;
}

export interface Location {
  id: string;
  locationID: string | null;
  locality: string;
  decimalLatitude: number | null;
  decimalLongitude: number | null;
  coordinateUncertaintyInMeters: number | null;
  ubigeo_district_id: string | null;
  created_at: string;
  updated_at: string;

  // Joins
  district?: UbigeoDistrict;
}

export interface Class {
  id: string;
  kingdom: string;
  phylum: string | null;
  name: string;
  label_name: string | null;
  icon: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  class_id: string;
  name: string;
  created_at: string;
  
  // Joined
  class_obj?: Class;
}

export interface Family {
  id: string;
  name: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;

  // Joined
  order_obj?: Order;
}

export interface Genus {
  id: string;
  family_id: string;
  name: string;
  created_at: string;
  updated_at: string;

  // Joined (optional)
  family?: Family;
}

export interface Taxon {
  id: string;
  taxonID: string | null;
  scientificName: string;
  acceptedNameUsage: string | null;
  specificEpithet: string | null;
  infraspecificEpithet: string | null;
  taxonRank: string;
  scientificNameAuthorship: string | null;
  vernacularName: string | null;
  nomenclaturalCode: string;
  genus_id: string | null;
  created_at: string;
  updated_at: string;

  // Joined (optional)
  genus?: Genus;
}

export interface Event {
  id: string;
  eventID: string;
  location_id: string;
  profile_id: string;
  eventDate: string;
  eventTime: string | null;
  samplingProtocol: string | null;
  make: string | null;
  model: string | null;
  dynamicProperties: Record<string, any>;
  record_status: "draft" | "published" | "deleted";
  created_at: string;
  updated_at: string;

  // Joins (optional)
  location?: Location;
}

export interface Occurrence {
  id: string;
  occurrenceID: string;
  event_id: string | null;
  location_id: string | null;
  taxon_id: string;
  basisOfRecord: string;
  collection_id: string | null;
  institution_id: string | null;
  catalogNumber: string | null;

  recordedBy: string;
  identifiedBy: string | null;
  identificationMethod: string;
  identificationConfidence: number | null;
  lifeStage: string | null;
  sex: string | null;
  reproductiveCondition: string | null;
  occurrenceRemarks: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verified_by: string | null;
  record_status: "draft" | "published" | "deleted";
  occurrence_date: string | null;
  ecosystem_id: string | null;
  
  // Environmental variables
  temperature_c: number | null;
  relative_humidity_percent: number | null;
  elevation_masl: number | null;
  
  // Physical Voucher
  has_cloud_voucher: boolean;

  created_at: string;
  updated_at: string;

  // Joins (optional)
  taxon?: Taxon;
  location?: Location;
  event?: Event;
  collection?: Collection;
  multimedia?: Multimedia[];
  ecosystem?: Ecosystem;
}

export interface NaturalRegion {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ecosystem {
  id: string;
  region_id: string;
  name: string;
  definition: string;
  diagnostic_factors: string[];
  botanical_species: string[];
  sources: string | null;
  typical_locality: string | null;
  observation: string | null;
  distribution_geojson: any | null;
  created_at: string;
  updated_at: string;

  // Joined
  region?: NaturalRegion;
}


export const BASIS_OF_RECORD = {
  PRESERVED_SPECIMEN: 'PreservedSpecimen',
  FOSSIL_SPECIMEN: 'FossilSpecimen',
  LIVING_SPECIMEN: 'LivingSpecimen',
  MATERIAL_SAMPLE: 'MaterialSample',
  EVENT: 'Event',
  HUMAN_OBSERVATION: 'HumanObservation',
  MACHINE_OBSERVATION: 'MachineObservation',
  TAXON: 'Taxon',
  OCCURRENCE: 'Occurrence',
} as const;

export const BASIS_OF_RECORD_LABELS: Record<string, string> = {
  [BASIS_OF_RECORD.PRESERVED_SPECIMEN]: 'Espécimen Preservado',
  [BASIS_OF_RECORD.FOSSIL_SPECIMEN]: 'Espécimen Fósil',
  [BASIS_OF_RECORD.LIVING_SPECIMEN]: 'Espécimen Vivo',
  [BASIS_OF_RECORD.MATERIAL_SAMPLE]: 'Muestra de Material',
  [BASIS_OF_RECORD.EVENT]: 'Evento',
  [BASIS_OF_RECORD.HUMAN_OBSERVATION]: 'Observación Humana',
  [BASIS_OF_RECORD.MACHINE_OBSERVATION]: 'Observación de Máquina',
  [BASIS_OF_RECORD.TAXON]: 'Taxón',
  [BASIS_OF_RECORD.OCCURRENCE]: 'Ocurrencia',
};

export const MEDIA_TYPE = {
  SOUND: 'Sound',
  STILL: 'Still',
  VIDEO: 'MovingImage',
  TEXT: 'Text',
} as const;

export const MEDIA_TAG = {
  MAIN_AUDIO: 'main_audio',
  SUPPORTING_AUDIO: 'supporting_audio',
  SPECTROGRAM: 'spectrogram',
  VOUCHER_PHOTO: 'voucher_photo',
  FIELD_PHOTO: 'field_photo',
  GALLERY: 'gallery',
  DOCUMENT: 'document',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export type MediaTag = (typeof MEDIA_TAG)[keyof typeof MEDIA_TAG];

export interface Multimedia {
  id: string;
  event_id: string | null;
  occurrence_id: string | null;
  identifier: string;
  originalFilename: string | null;
  type: MediaType;
  format: string;
  title: string | null;
  description: string | null;
  creator: string;
  rightsHolder: string;
  license: string;
  guano_metadata: Record<string, any>;
  order_index: number;
  tag: string | null;
  parent_multimedia_id: string | null;
  record_status: "draft" | "published" | "deleted";
  is_public: boolean;
  created_at: string;
  updated_at: string;

  // Joins (optional)
  occurrence?: Occurrence;
  event?: Event;
}

export interface AudioRequest {
  id: string;
  requester_email: string;
  requester_name: string | null;
  institution: string | null;
  observation_rationale: string;
  request_status: 'pending' | 'approved' | 'rejected' | 'expired';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined
  items?: Multimedia[];
}

export interface DownloadLog {
  id: string;
  multimedia_id: string;
  profile_id: string | null;
  ip_address: string | null;
  downloaded_at: string;
}

export const TAXON_KINGDOM = {
  ANIMALIA: 'Animalia',
  PLANTAE: 'Plantae',
  FUNGI: 'Fungi',
  PROTISTA: 'Protista',
  ARCHAEA: 'Archaea',
  BACTERIA: 'Bacteria',
} as const;

export const TAXON_PHYLUM = {
  CHORDATA: 'Chordata',
  ARTHROPODA: 'Arthropoda',
  MOLLUSCA: 'Mollusca',
  ANNELIDA: 'Annelida',
  CNIDARIA: 'Cnidaria',
  ECHINODERMATA: 'Echinodermata',
  PORIFERA: 'Porifera',
} as const;

export interface Address {
  city: string;
  address: string;
  country: string;
  province: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  additional_names: string[];
  type: string;
  is_active: boolean;
  founding_year: number | null;
  specimen_count: number;
  description: string | null;
  homepage_url: string | null;
  phones: string[];
  email: string | null;
  display_on_nhc_portal: boolean;
  latitude: number | null;
  longitude: number | null;
  physical_address: Address;
  mailing_address: Address;
  created_at: string;
  created_by: string;
  modified_at: string;
  modified_by: string;
}

export interface Collection {
  id: string;
  institution_id: string;
  code: string;
  name: string;
  registry_url: string | null;
  record_status: "draft" | "published" | "deleted";
  created_at: string;
  updated_at: string;

  // Joined
  institution?: Institution;
}

