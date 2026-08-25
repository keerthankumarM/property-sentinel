export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          article_id: string | null
          channels: string[]
          created_at: string
          id: string
          is_read: boolean
          match_reason: string | null
          match_score: number | null
          property_id: string | null
          risk_level: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          channels?: string[]
          created_at?: string
          id?: string
          is_read?: boolean
          match_reason?: string | null
          match_score?: number | null
          property_id?: string | null
          risk_level?: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          channels?: string[]
          created_at?: string
          id?: string
          is_read?: boolean
          match_reason?: string | null
          match_score?: number | null
          property_id?: string | null
          risk_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "land_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "monitored_properties"
            referencedColumns: ["id"]
          },
        ]
      }
      land_articles: {
        Row: {
          area_extent: string | null
          confidence: number | null
          court_info: string | null
          created_at: string
          dispute_type: string | null
          district: string | null
          id: string
          important_dates: string[]
          language: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          newspaper_id: string
          newspaper_name: string | null
          organizations: string[]
          original_text: string | null
          owner_names: string[]
          persons: string[]
          publication_date: string | null
          risk_level: string
          source_page: string | null
          state: string | null
          summary: string | null
          survey_number: string | null
          taluk: string | null
          title: string | null
          user_id: string
          verification_status: string
          village: string | null
        }
        Insert: {
          area_extent?: string | null
          confidence?: number | null
          court_info?: string | null
          created_at?: string
          dispute_type?: string | null
          district?: string | null
          id?: string
          important_dates?: string[]
          language?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          newspaper_id: string
          newspaper_name?: string | null
          organizations?: string[]
          original_text?: string | null
          owner_names?: string[]
          persons?: string[]
          publication_date?: string | null
          risk_level?: string
          source_page?: string | null
          state?: string | null
          summary?: string | null
          survey_number?: string | null
          taluk?: string | null
          title?: string | null
          user_id: string
          verification_status?: string
          village?: string | null
        }
        Update: {
          area_extent?: string | null
          confidence?: number | null
          court_info?: string | null
          created_at?: string
          dispute_type?: string | null
          district?: string | null
          id?: string
          important_dates?: string[]
          language?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          newspaper_id?: string
          newspaper_name?: string | null
          organizations?: string[]
          original_text?: string | null
          owner_names?: string[]
          persons?: string[]
          publication_date?: string | null
          risk_level?: string
          source_page?: string | null
          state?: string | null
          summary?: string | null
          survey_number?: string | null
          taluk?: string | null
          title?: string | null
          user_id?: string
          verification_status?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "land_articles_newspaper_id_fkey"
            columns: ["newspaper_id"]
            isOneToOne: false
            referencedRelation: "newspapers"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_properties: {
        Row: {
          area_extent: string | null
          created_at: string
          district: string | null
          id: string
          label: string | null
          latitude: number | null
          longitude: number | null
          notify_email: boolean
          notify_sms: boolean
          notify_whatsapp: boolean
          owner_name: string | null
          state: string | null
          survey_number: string | null
          taluk: string | null
          user_id: string
          village: string | null
        }
        Insert: {
          area_extent?: string | null
          created_at?: string
          district?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          owner_name?: string | null
          state?: string | null
          survey_number?: string | null
          taluk?: string | null
          user_id: string
          village?: string | null
        }
        Update: {
          area_extent?: string | null
          created_at?: string
          district?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          notify_email?: boolean
          notify_sms?: boolean
          notify_whatsapp?: boolean
          owner_name?: string | null
          state?: string | null
          survey_number?: string | null
          taluk?: string | null
          user_id?: string
          village?: string | null
        }
        Relationships: []
      }
      newspapers: {
        Row: {
          articles_detected: number
          created_at: string
          error_message: string | null
          file_name: string
          id: string
          language: string | null
          mime_type: string | null
          newspaper_name: string | null
          ocr_text: string | null
          page_count: number | null
          publication_date: string | null
          status: string
          storage_path: string
          user_id: string
        }
        Insert: {
          articles_detected?: number
          created_at?: string
          error_message?: string | null
          file_name: string
          id?: string
          language?: string | null
          mime_type?: string | null
          newspaper_name?: string | null
          ocr_text?: string | null
          page_count?: number | null
          publication_date?: string | null
          status?: string
          storage_path: string
          user_id: string
        }
        Update: {
          articles_detected?: number
          created_at?: string
          error_message?: string | null
          file_name?: string
          id?: string
          language?: string | null
          mime_type?: string | null
          newspaper_name?: string | null
          ocr_text?: string | null
          page_count?: number | null
          publication_date?: string | null
          status?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_notices: {
        Row: {
          block: string | null
          body: string | null
          created_at: string
          district: string | null
          effective_date: string | null
          id: string
          is_published: boolean
          issuing_authority: string | null
          notice_type: string
          reference_number: string | null
          source_url: string | null
          state: string
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          block?: string | null
          body?: string | null
          created_at?: string
          district?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean
          issuing_authority?: string | null
          notice_type?: string
          reference_number?: string | null
          source_url?: string | null
          state?: string
          summary?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          block?: string | null
          body?: string | null
          created_at?: string
          district?: string | null
          effective_date?: string | null
          id?: string
          is_published?: boolean
          issuing_authority?: string | null
          notice_type?: string
          reference_number?: string | null
          source_url?: string | null
          state?: string
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
