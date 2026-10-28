// Escrito à mão para refletir supabase/migrations/0001_init.sql.
// Assim que o projeto Supabase estiver linkado, regerar com:
//   supabase gen types typescript --linked > src/types/database.types.ts

export type WineType = 'tinto' | 'branco' | 'rose' | 'espumante' | 'fortificado' | 'outro'
export type BottleStatus = 'active' | 'consumed'
export type DisplayMode = 'illustrated' | 'photo'
export type PreferredLanguage = 'pt-BR' | 'en' | 'es'

export interface SlotPosition {
  x: number
  y: number
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          background_image_url: string | null
          display_mode: DisplayMode
          preferred_language: PreferredLanguage
          terms_accepted_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          background_image_url?: string | null
          display_mode?: DisplayMode
          preferred_language?: PreferredLanguage
          terms_accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          background_image_url?: string | null
          display_mode?: DisplayMode
          preferred_language?: PreferredLanguage
          terms_accepted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      shelves: {
        Row: {
          id: string
          user_id: string
          shelf_index: number
          name: string | null
          capacity: number
          slot_positions: SlotPosition[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shelf_index: number
          name?: string | null
          capacity: number
          slot_positions?: SlotPosition[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shelf_index?: number
          name?: string | null
          capacity?: number
          slot_positions?: SlotPosition[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bottles: {
        Row: {
          id: string
          user_id: string
          name: string
          wine_type: WineType
          grapes: string[] | null
          country: string | null
          region: string | null
          winery: string | null
          vintage_year: number | null
          label_photo_url: string | null
          rating: number | null
          tasting_notes: string | null
          shelf_id: string | null
          slot_index: number | null
          status: BottleStatus
          consumed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          wine_type: WineType
          grapes?: string[] | null
          country?: string | null
          region?: string | null
          winery?: string | null
          vintage_year?: number | null
          label_photo_url?: string | null
          rating?: number | null
          tasting_notes?: string | null
          shelf_id?: string | null
          slot_index?: number | null
          status?: BottleStatus
          consumed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          wine_type?: WineType
          grapes?: string[] | null
          country?: string | null
          region?: string | null
          winery?: string | null
          vintage_year?: number | null
          label_photo_url?: string | null
          rating?: number | null
          tasting_notes?: string | null
          shelf_id?: string | null
          slot_index?: number | null
          status?: BottleStatus
          consumed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scan_usage: {
        Row: {
          user_id: string
          scan_date: string
          count: number
        }
        Insert: {
          user_id: string
          scan_date?: string
          count?: number
        }
        Update: {
          user_id?: string
          scan_date?: string
          count?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
