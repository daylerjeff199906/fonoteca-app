export interface Location {
  id: string;
  locationID: string | null;
  continent: string;
  country: string;
  countryCode: string;
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

export interface Class {
  id: string;
  kingdom: string;
  phylum: string | null;
  name: string;
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
  kingdom: string | null;
  phylum: string | null;
  class: string | null;
  order: string | null;
  created_at: string;

  // Joined
  order_obj?: Order;
}

export interface Genus {
  id: string;
  family_id: string;
  name: string;
  created_at: string;

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
  institutionCode: string;
  collectionCode: string;
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
  created_at: string;

  // Joins (optional)
  taxon?: Taxon;
  location?: Location;
  event?: Event;
  multimedia?: Multimedia[];
}

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
