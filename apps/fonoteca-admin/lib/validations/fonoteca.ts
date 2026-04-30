import { z } from "zod";

// Helper tool to handle numeric fields from HTML inputs that send empty strings.
const numberOrNull = z.preprocess(
  (v) => (v === "" || v === undefined || v === null ? null : v),
  z.coerce.number().nullable().optional()
);

// --- Classes ---
export const classSchema = z.object({
  id: z.string().uuid().optional(),
  kingdom: z.string().default("Animalia"),
  phylum: z.string().default("Chordata").nullable().optional(),
  name: z.string().min(1, "Class name is required"),
  label_name: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

export type ClassInput = z.infer<typeof classSchema>;

// --- Orders ---
export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  class_id: z.string().uuid("Invalid Class ID"),
  name: z.string().min(1, "Order name is required"),
});

export type OrderInput = z.infer<typeof orderSchema>;

// --- Families ---
export const familySchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid("Invalid Order ID"),
  name: z.string().min(1, "Family name is required"),
});

export type FamilyInput = z.infer<typeof familySchema>;

// --- Genera ---
export const genusSchema = z.object({
  id: z.string().uuid().optional(),
  family_id: z.string().uuid("Invalid Family ID"),
  name: z.string().min(1, "Genus name is required"),
});

export type GenusInput = z.infer<typeof genusSchema>;

// --- Taxa ---
export const taxonSchema = z.object({
  id: z.string().uuid().optional(),
  taxonID: z.string().optional().nullable(),
  scientificName: z.string().min(1, "Scientific Name is required"),
  acceptedNameUsage: z.string().optional().nullable(),
  specificEpithet: z.string().optional().nullable(),
  infraspecificEpithet: z.string().optional().nullable(),
  taxonRank: z.string(),
  scientificNameAuthorship: z.string().optional().nullable(),
  vernacularName: z.string().optional().nullable(),
  nomenclaturalCode: z.string(),
  genus_id: z.string().uuid("Invalid Genus ID").optional().nullable(),
});

export type TaxonInput = z.infer<typeof taxonSchema>;

// --- Locations ---
export const locationSchema = z.object({
  id: z.string().uuid().optional(),
  locationID: z.string().optional().nullable(),
  continent: z.string().default("South America"),
  country: z.string().default("Peru"),
  countryCode: z.string().default("PE"),
  stateProvince: z.string().default("Loreto"),
  county: z.string().optional().nullable(),
  locality: z.string().min(1, "Locality is required"),
  decimalLatitude: numberOrNull,
  decimalLongitude: numberOrNull,
  coordinateUncertaintyInMeters: numberOrNull,
  elevation: numberOrNull,
  elevationAccuracy: numberOrNull,
  habitat: z.string().optional().nullable(),
});

export type LocationInput = z.infer<typeof locationSchema>;

// --- Events ---
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  eventID: z.string().min(1, "Event ID is required"),
  location_id: z.string().uuid("Invalid Location ID"),
  profile_id: z.string().uuid("Invalid Profile ID"),
  eventDate: z.string().min(1, "Event Date is required"), // YYYY-MM-DD
  eventTime: z.string().optional().nullable(), // HH:MM:SS
  samplingProtocol: z.string().optional().nullable(),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  dynamicProperties: z.record(z.any()).default({}),
  record_status: z.enum(["draft", "published", "deleted"]).default("draft"),
});

export type EventInput = z.infer<typeof eventSchema>;

// --- Occurrences ---
export const occurrenceSchema = z.object({
  id: z.string().uuid().optional(),
  occurrenceID: z.string().min(1, "Occurrence ID is required"),
  event_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  taxon_id: z.string().uuid("Invalid Taxon ID"),
  basisOfRecord: z.string().default("MachineObservation"),
  collection_id: z.string().uuid("Colección inválida").optional().nullable(),
  catalogNumber: z.string().optional().nullable(),

  recordedBy: z.string().min(1, "Recorded By is required"),
  identifiedBy: z.string().optional().nullable(),
  identificationMethod: z.string().default("Manual"),
  identificationConfidence: numberOrNull,
  lifeStage: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  reproductiveCondition: z.string().optional().nullable(),
  occurrenceRemarks: z.string().optional().nullable(),
  verification_status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verified_by: z.string().uuid().optional().nullable(),
  record_status: z.enum(["draft", "published", "deleted"]).default("draft"),
  occurrence_date: z.string().optional().nullable(),
  ecosystem_id: z.string().uuid().optional().nullable(),
});

export type OccurrenceInput = z.infer<typeof occurrenceSchema>;

// --- Multimedia ---
export const multimediaSchema = z.object({
  id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional().nullable(),
  occurrence_id: z.string().uuid().optional().nullable(),
  identifier: z.string().min(1, "Identifier is required"),
  originalFilename: z.string().optional().nullable(),
  type: z.string().default("Sound"),
  format: z.string().default("audio/wav"),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  creator: z.string().min(1, "Creator is required"),
  rightsHolder: z.string().default("Instituto de Investigaciones de la Amazonía Peruana (IIAP)"),
  license: z.string().default("http://creativecommons.org/licenses/by-nc/4.0/"),
  guano_metadata: z.record(z.any()).optional().default({}),
  order_index: z.coerce.number().optional().default(0),
  tag: z.string().optional().nullable(),
  parent_multimedia_id: z.string().uuid().optional().nullable(),
  record_status: z.enum(["draft", "published", "deleted"]).optional().default("draft"),
  is_public: z.boolean().optional().default(true),
});

export type MultimediaInput = z.input<typeof multimediaSchema>;

// --- Institutions ---
export const addressSchema = z.object({
  city: z.string().default(""),
  address: z.string().default(""),
  country: z.string().default("Peru"),
  province: z.string().default(""),
});

export const institutionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  code: z.string().min(1, "El código es requerido"),
  additional_names: z.array(z.string()).default([]),
  type: z.string().default("Fonoteca"),
  is_active: z.boolean().default(true),
  founding_year: numberOrNull,
  specimen_count: z.coerce.number().default(0),
  description: z.string().optional().nullable(),
  homepage_url: z.string().url("URL inválida").or(z.string().length(0)).optional().nullable(),
  phones: z.array(z.string()).default([]),
  email: z.string().email("Email inválido").or(z.string().length(0)).optional().nullable(),
  display_on_nhc_portal: z.boolean().default(true),
  latitude: numberOrNull,
  longitude: numberOrNull,
  physical_address: addressSchema.default({}),
  mailing_address: addressSchema.default({}),
});

export type InstitutionInput = z.infer<typeof institutionSchema>;

// --- Collections ---
export const collectionSchema = z.object({
  id: z.string().uuid().optional(),
  institution_id: z.string().uuid("ID de institución inválido"),
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  registry_url: z.string().url("URL inválida").or(z.string().length(0)).optional().nullable(),
  record_status: z.enum(["draft", "published", "deleted"]).default("published"),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

// --- Natural Regions ---
export const naturalRegionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
});

export type NaturalRegionInput = z.infer<typeof naturalRegionSchema>;

// --- Ecosystems ---
export const ecosystemSchema = z.object({
  id: z.string().uuid().optional(),
  region_id: z.string().uuid("ID de Región Natural inválido"),
  name: z.string().min(1, "El nombre es requerido"),
  definition: z.string().min(1, "La definición es requerida"),
  diagnostic_factors: z.array(z.string()).default([]),
  botanical_species: z.array(z.string()).default([]),
  sources: z.string().optional().nullable(),
  typical_locality: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  distribution_geojson: z.any().optional().nullable(),
});

export type EcosystemInput = z.infer<typeof ecosystemSchema>;


