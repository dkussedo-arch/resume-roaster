/**
 * Supabase database types for Resume Roaster.
 *
 * Regenerate from your project with:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      analysis_sessions: {
        Row: {
          id: string
          user_id: string | null
          resume_text: string
          job_description: string | null
          target_industry: string | null
          target_seniority: string | null
          context_confirmed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          resume_text: string
          job_description?: string | null
          target_industry?: string | null
          target_seniority?: string | null
          context_confirmed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          resume_text?: string
          job_description?: string | null
          target_industry?: string | null
          target_seniority?: string | null
          context_confirmed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analysis_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      analysis_results: {
        Row: {
          id: string
          session_id: string
          result_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          result_json: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          result_json?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'analysis_results_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'analysis_sessions'
            referencedColumns: ['id']
          },
        ]
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
