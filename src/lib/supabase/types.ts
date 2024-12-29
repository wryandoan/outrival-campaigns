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
      campaigns: {
        Row: {
          campaign_id: string
          name: string
          status: 'Active' | 'Completed'
          start_date: string
          end_date: string | null
          phone_numbers: Json | null
          owner: string
          goal: string
          created_at: string
          updated_at: string
        }
        Insert: {
          campaign_id?: string
          name: string
          status?: 'Active' | 'Completed'
          start_date: string
          end_date?: string | null
          phone_numbers?: Json | null
          owner: string
          goal: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          name?: string
          status?: 'Active' | 'Completed'
          start_date?: string
          end_date?: string | null
          phone_numbers?: Json | null
          owner?: string
          goal?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... other table definitions
    }
  }
}