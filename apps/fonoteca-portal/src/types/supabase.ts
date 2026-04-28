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
      audio_request_items: {
        Row: {
          request_id: string
          multimedia_id: string
          created_at: string | null
        }
        Insert: {
          request_id: string
          multimedia_id: string
          created_at?: string | null
        }
        Update: {
          request_id?: string
          multimedia_id?: string
          created_at?: string | null
        }
      }
      audio_requests: {
        Row: {
          id: string
          requester_email: string
          requester_name: string | null
          institution: string | null
          observation_rationale: string
          request_status: string | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          requester_email: string
          requester_name?: string | null
          institution?: string | null
          observation_rationale: string
          request_status?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          requester_email?: string
          requester_name?: string | null
          institution?: string | null
          observation_rationale?: string
          request_status?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          kingdom: string
          phylum: string | null
          name: string
          label_name: Json | null
          icon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          kingdom?: string
          phylum?: string | null
          name: string
          label_name?: Json | null
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          kingdom?: string
          phylum?: string | null
          name?: string
          label_name?: Json | null
          icon?: string | null
          created_at?: string | null
        }
      }
      download_logs: {
        Row: {
          id: string
          multimedia_id: string
          profile_id: string | null
          ip_address: string | null
          downloaded_at: string | null
        }
        Insert: {
          id?: string
          multimedia_id: string
          profile_id?: string | null
          ip_address?: string | null
          downloaded_at?: string | null
        }
        Update: {
          id?: string
          multimedia_id?: string
          profile_id?: string | null
          ip_address?: string | null
          downloaded_at?: string | null
        }
      }
      events: {
        Row: {
          id: string
          eventID: string
          location_id: string
          profile_id: string
          eventDate: string
          eventTime: string | null
          samplingProtocol: string | null
          make: string | null
          model: string | null
          dynamicProperties: Json | null
          record_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          eventID: string
          location_id: string
          profile_id: string
          eventDate: string
          eventTime?: string | null
          samplingProtocol?: string | null
          make?: string | null
          model?: string | null
          dynamicProperties?: Json | null
          record_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          eventID?: string
          location_id?: string
          profile_id?: string
          eventDate?: string
          eventTime?: string | null
          samplingProtocol?: string | null
          make?: string | null
          model?: string | null
          dynamicProperties?: Json | null
          record_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      families: {
        Row: {
          id: string
          name: string
          order_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          order_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          order_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      genera: {
        Row: {
          id: string
          family_id: string
          name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          created_at?: string | null
          updated_at?: string | null
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
        }
      }
      multimedia: {
        Row: {
          id: string
          event_id: string | null
          occurrence_id: string | null
          identifier: string
          originalFilename: string | null
          type: string
          format: string
          title: string | null
          description: string | null
          creator: string
          rightsHolder: string | null
          license: string | null
          guano_metadata: Json | null
          order_index: number | null
          tag: string | null
          parent_multimedia_id: string | null
          record_status: string | null
          is_public: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          event_id?: string | null
          occurrence_id?: string | null
          identifier: string
          originalFilename?: string | null
          type?: string
          format?: string
          title?: string | null
          description?: string | null
          creator: string
          rightsHolder?: string | null
          license?: string | null
          guano_metadata?: Json | null
          order_index?: number | null
          tag?: string | null
          parent_multimedia_id?: string | null
          record_status?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string | null
          occurrence_id?: string | null
          identifier?: string
          originalFilename?: string | null
          type?: string
          format?: string
          title?: string | null
          description?: string | null
          creator?: string
          rightsHolder?: string | null
          license?: string | null
          guano_metadata?: Json | null
          order_index?: number | null
          tag?: string | null
          parent_multimedia_id?: string | null
          record_status?: string | null
          is_public?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      occurrences: {
        Row: {
          id: string
          occurrenceID: string
          event_id: string | null
          location_id: string | null
          taxon_id: string
          basisOfRecord: string | null
          institutionCode: string | null
          collectionCode: string | null
          catalogNumber: string | null
          recordedBy: string
          identifiedBy: string | null
          identificationMethod: string | null
          identificationConfidence: number | null
          lifeStage: string | null
          sex: string | null
          reproductiveCondition: string | null
          occurrenceRemarks: string | null
          verification_status: string | null
          verified_by: string | null
          record_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          occurrenceID: string
          event_id?: string | null
          location_id?: string | null
          taxon_id: string
          basisOfRecord?: string | null
          institutionCode?: string | null
          collectionCode?: string | null
          catalogNumber?: string | null
          recordedBy: string
          identifiedBy?: string | null
          identificationMethod?: string | null
          identificationConfidence?: number | null
          lifeStage?: string | null
          sex?: string | null
          reproductiveCondition?: string | null
          occurrenceRemarks?: string | null
          verification_status?: string | null
          verified_by?: string | null
          record_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          occurrenceID?: string
          event_id?: string | null
          location_id?: string | null
          taxon_id?: string
          basisOfRecord?: string | null
          institutionCode?: string | null
          collectionCode?: string | null
          catalogNumber?: string | null
          recordedBy?: string
          identifiedBy?: string | null
          identificationMethod?: string | null
          identificationConfidence?: number | null
          lifeStage?: string | null
          sex?: string | null
          reproductiveCondition?: string | null
          occurrenceRemarks?: string | null
          verification_status?: string | null
          verified_by?: string | null
          record_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          class_id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          created_at?: string | null
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
          genus_id: string | null
          created_at: string | null
          updated_at: string | null
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
          genus_id?: string | null
          created_at?: string | null
          updated_at?: string | null
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
          genus_id?: string | null
          created_at?: string | null
          updated_at?: string | null
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
export type AudioRequestItem = Database['public']['Tables']['audio_request_items']['Row']
export type AudioRequest = Database['public']['Tables']['audio_requests']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type DownloadLog = Database['public']['Tables']['download_logs']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Family = Database['public']['Tables']['families']['Row']
export type Genus = Database['public']['Tables']['genera']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Multimedia = Database['public']['Tables']['multimedia']['Row']
export type Occurrence = Database['public']['Tables']['occurrences']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Taxon = Database['public']['Tables']['taxa']['Row']
