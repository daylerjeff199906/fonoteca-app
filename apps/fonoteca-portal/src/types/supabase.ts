export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          kingdom: string | null
          phylum: string | null
          class: string
          order: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          kingdom?: string | null
          phylum?: string | null
          class: string
          order: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          kingdom?: string | null
          phylum?: string | null
          class?: string
          order?: string
          name?: string
          created_at?: string | null
        }
      }
      genera: {
        Row: {
          id: string
          family_id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          created_at?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          locationID: string | null
          continent: string | null
          country: string | null
          countryCode: string | null
          stateProvince: string | null
          county: string | null
          locality: string
          decimalLatitude: number | null
          decimalLongitude: number | null
          coordinateUncertaintyInMeters: number | null
          elevation: number | null
          elevationAccuracy: number | null
          habitat: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          locationID?: string | null
          continent?: string | null
          country?: string | null
          countryCode?: string | null
          stateProvince?: string | null
          county?: string | null
          locality: string
          decimalLatitude?: number | null
          decimalLongitude?: number | null
          coordinateUncertaintyInMeters?: number | null
          elevation?: number | null
          elevationAccuracy?: number | null
          habitat?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          locationID?: string | null
          continent?: string | null
          country?: string | null
          countryCode?: string | null
          stateProvince?: string | null
          county?: string | null
          locality?: string
          decimalLatitude?: number | null
          decimalLongitude?: number | null
          coordinateUncertaintyInMeters?: number | null
          elevation?: number | null
          elevationAccuracy?: number | null
          habitat?: string | null
          created_at?: string | null
        }
      }
      multimedia: {
        Row: {
          id: string
          occurrence_id: string
          identifier: string
          type: string
          format: string
          order_index: number | null
          title: string | null
          description: string | null
          creator: string
          rightsHolder: string | null
          license: string | null
          equipmentUsed: string | null
          software: string | null
          samplingRate: number | null
          bitrate: string | null
          audioChannel: string | null
          lensAperture: string | null
          exposureTime: string | null
          iso: number | null
          focalLength: string | null
          created_at: string | null
          tag: string | null
          parent_multimedia_id: string | null
        }
        Insert: {
          id?: string
          occurrence_id: string
          identifier: string
          type: string
          format: string
          order_index?: number | null
          title?: string | null
          description?: string | null
          creator: string
          rightsHolder?: string | null
          license?: string | null
          equipmentUsed?: string | null
          software?: string | null
          samplingRate?: number | null
          bitrate?: string | null
          audioChannel?: string | null
          lensAperture?: string | null
          exposureTime?: string | null
          iso?: number | null
          focalLength?: string | null
          created_at?: string | null
          tag?: string | null
          parent_multimedia_id?: string | null
        }
        Update: {
          id?: string
          occurrence_id?: string
          identifier?: string
          type?: string
          format?: string
          order_index?: number | null
          title?: string | null
          description?: string | null
          creator?: string
          rightsHolder?: string | null
          license?: string | null
          equipmentUsed?: string | null
          software?: string | null
          samplingRate?: number | null
          bitrate?: string | null
          audioChannel?: string | null
          lensAperture?: string | null
          exposureTime?: string | null
          iso?: number | null
          focalLength?: string | null
          created_at?: string | null
          tag?: string | null
          parent_multimedia_id?: string | null
        }
      }
      occurrences: {
        Row: {
          id: string
          occurrenceID: string
          taxon_id: string
          location_id: string
          profile_id: string
          basisOfRecord: string
          institutionCode: string | null
          collectionCode: string | null
          catalogNumber: string | null
          recordedBy: string
          identifiedBy: string | null
          eventDate: string
          eventTime: string | null
          samplingProtocol: string | null
          lifeStage: string | null
          sex: string | null
          reproductiveCondition: string | null
          occurrenceRemarks: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          occurrenceID: string
          taxon_id: string
          location_id: string
          profile_id: string
          basisOfRecord: string
          institutionCode?: string | null
          collectionCode?: string | null
          catalogNumber?: string | null
          recordedBy: string
          identifiedBy?: string | null
          eventDate: string
          eventTime?: string | null
          samplingProtocol?: string | null
          lifeStage?: string | null
          sex?: string | null
          reproductiveCondition?: string | null
          occurrenceRemarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          occurrenceID?: string
          taxon_id?: string
          location_id?: string
          profile_id?: string
          basisOfRecord?: string
          institutionCode?: string | null
          collectionCode?: string | null
          catalogNumber?: string | null
          recordedBy?: string
          identifiedBy?: string | null
          eventDate?: string
          eventTime?: string | null
          samplingProtocol?: string | null
          lifeStage?: string | null
          sex?: string | null
          reproductiveCondition?: string | null
          occurrenceRemarks?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      taxa: {
        Row: {
          id: string
          taxonID: string | null
          scientificName: string
          acceptedNameUsage: string | null
          specificEpithet: string | null
          infraspecificEpithet: string | null
          taxonRank: string | null
          scientificNameAuthorship: string | null
          vernacularName: string | null
          nomenclaturalCode: string | null
          created_at: string | null
          updated_at: string | null
          genus_id: string | null
        }
        Insert: {
          id?: string
          taxonID?: string | null
          scientificName: string
          acceptedNameUsage?: string | null
          specificEpithet?: string | null
          infraspecificEpithet?: string | null
          taxonRank?: string | null
          scientificNameAuthorship?: string | null
          vernacularName?: string | null
          nomenclaturalCode?: string | null
          created_at?: string | null
          updated_at?: string | null
          genus_id?: string | null
        }
        Update: {
          id?: string
          taxonID?: string | null
          scientificName?: string
          acceptedNameUsage?: string | null
          specificEpithet?: string | null
          infraspecificEpithet?: string | null
          taxonRank?: string | null
          scientificNameAuthorship?: string | null
          vernacularName?: string | null
          nomenclaturalCode?: string | null
          created_at?: string | null
          updated_at?: string | null
          genus_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier imports
export type Family = Database['public']['Tables']['families']['Row']
export type FamilyInsert = Database['public']['Tables']['families']['Insert']
export type FamilyUpdate = Database['public']['Tables']['families']['Update']

export type Genus = Database['public']['Tables']['genera']['Row']
export type GenusInsert = Database['public']['Tables']['genera']['Insert']
export type GenusUpdate = Database['public']['Tables']['genera']['Update']

export type Location = Database['public']['Tables']['locations']['Row']
export type LocationInsert = Database['public']['Tables']['locations']['Insert']
export type LocationUpdate = Database['public']['Tables']['locations']['Update']

export type Multimedia = Database['public']['Tables']['multimedia']['Row']
export type MultimediaInsert = Database['public']['Tables']['multimedia']['Insert']
export type MultimediaUpdate = Database['public']['Tables']['multimedia']['Update']

export type Occurrence = Database['public']['Tables']['occurrences']['Row']
export type OccurrenceInsert = Database['public']['Tables']['occurrences']['Insert']
export type OccurrenceUpdate = Database['public']['Tables']['occurrences']['Update']

export type Taxon = Database['public']['Tables']['taxa']['Row']
export type TaxonInsert = Database['public']['Tables']['taxa']['Insert']
export type TaxonUpdate = Database['public']['Tables']['taxa']['Update']

