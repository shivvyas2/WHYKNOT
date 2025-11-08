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
      users: {
        Row: {
          id: string
          email: string
          role: 'business' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'business' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'business' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_opt_ins: {
        Row: {
          id: string
          user_id: string
          merchant: string
          is_active: boolean
          knot_connection_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          is_active: boolean
          knot_connection_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          merchant?: string
          is_active?: boolean
          knot_connection_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transaction_cache: {
        Row: {
          id: string
          user_id: string
          merchant: string
          transaction_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant: string
          transaction_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          merchant?: string
          transaction_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          promo_code: string
          amount: number
          currency: string
          is_used: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          promo_code: string
          amount: number
          currency: string
          is_used?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          promo_code?: string
          amount?: number
          currency?: string
          is_used?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          merchant: string
          discount_percentage: number | null
          discount_amount: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          merchant: string
          discount_percentage?: number | null
          discount_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          merchant?: string
          discount_percentage?: number | null
          discount_amount?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
  }
}

