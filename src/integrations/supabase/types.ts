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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      contact_requests: {
        Row: {
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          message: string | null
          owner_user_id: string | null
          requester_email: string
          requester_name: string | null
          requester_user_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          message?: string | null
          owner_user_id?: string | null
          requester_email: string
          requester_name?: string | null
          requester_user_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          message?: string | null
          owner_user_id?: string | null
          requester_email?: string
          requester_name?: string | null
          requester_user_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      contact_view_logs: {
        Row: {
          contact_fields_viewed: string[]
          id: string
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
          viewed_entity_id: string
          viewed_entity_name: string
          viewed_entity_type: string
          viewer_email: string
          viewer_user_id: string
        }
        Insert: {
          contact_fields_viewed: string[]
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewed_entity_id: string
          viewed_entity_name: string
          viewed_entity_type: string
          viewer_email: string
          viewer_user_id: string
        }
        Update: {
          contact_fields_viewed?: string[]
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
          viewed_entity_id?: string
          viewed_entity_name?: string
          viewed_entity_type?: string
          viewer_email?: string
          viewer_user_id?: string
        }
        Relationships: []
      }
      former_students: {
        Row: {
          contributor_name: string | null
          course: string
          created_at: string | null
          additional_info: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          school_id: string
          university: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          contributor_name?: string | null
          course: string
          created_at?: string | null
          additional_info?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          school_id: string
          university: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          contributor_name?: string | null
          course?: string
          created_at?: string | null
          additional_info?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          school_id?: string
          university?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "former_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          additional_info: string | null
          contributor_name: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          school_id: string
          subject: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_info?: string | null
          contributor_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          school_id: string
          subject: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_info?: string | null
          contributor_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          school_id?: string
          subject?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_former_students: {
        Row: {
          consent_to_share_data: boolean | null
          contributor_name: string | null
          course: string
          additional_info: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          university: string
          whatsapp: string | null
        }
        Insert: {
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          course: string
          additional_info?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          university: string
          whatsapp?: string | null
        }
        Update: {
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          course?: string
          additional_info?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          university?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      pending_instructors: {
        Row: {
          additional_info: string | null
          consent_to_share_data: boolean | null
          contributor_name: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          name: string
          periods: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string | null
          school_name: string | null
          shifts: string[] | null
          status: string | null
          subject: string
          submitted_at: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_info?: string | null
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name: string
          periods?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string | null
          school_name?: string | null
          shifts?: string[] | null
          status?: string | null
          subject: string
          submitted_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_info?: string | null
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          name?: string
          periods?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string | null
          school_name?: string | null
          shifts?: string[] | null
          status?: string | null
          subject?: string
          submitted_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      instructor_periods: {
        Row: {
          id: string
          instructor_id: string
          period: string
        }
        Insert: {
          id?: string
          instructor_id: string
          period: string
        }
        Update: {
          id?: string
          instructor_id?: string
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_periods_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_shifts: {
        Row: {
          id: string
          instructor_id: string
          shift: string
        }
        Insert: {
          id?: string
          instructor_id: string
          shift: string
        }
        Update: {
          id?: string
          instructor_id?: string
          shift?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_shifts_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_schools: {
        Row: {
          additional_info: string | null
          consent_to_share_data: boolean | null
          contributor_name: string | null
          email: string | null
          full_address: string
          id: string
          instructors: Json | null
          latitude: number
          longitude: number
          name: string
          nature: string
          neighborhood: string
          periods: string[] | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shifts: string[] | null
          status: string | null
          subjects: string[] | null
          submitted_at: string | null
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          email?: string | null
          full_address: string
          id?: string
          instructors?: Json | null
          latitude: number
          longitude: number
          name: string
          nature: string
          neighborhood: string
          periods?: string[] | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shifts?: string[] | null
          status?: string | null
          subjects?: string[] | null
          submitted_at?: string | null
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          consent_to_share_data?: boolean | null
          contributor_name?: string | null
          email?: string | null
          full_address?: string
          id?: string
          instructors?: Json | null
          latitude?: number
          longitude?: number
          name?: string
          nature?: string
          neighborhood?: string
          periods?: string[] | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shifts?: string[] | null
          status?: string | null
          subjects?: string[] | null
          submitted_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pending_school_updates: {
        Row: {
          additional_info: string | null
          contributor_name: string | null
          contributor_position: string | null
          email: string | null
          id: string
          instructors: Json | null
          phone: string | null
          periods: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          shifts: string[] | null
          status: string | null
          subjects: string[] | null
          submitted_at: string | null
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          contributor_name?: string | null
          contributor_position?: string | null
          email?: string | null
          id?: string
          instructors?: Json | null
          phone?: string | null
          periods?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          shifts?: string[] | null
          status?: string | null
          subjects?: string[] | null
          submitted_at?: string | null
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          contributor_name?: string | null
          contributor_position?: string | null
          email?: string | null
          id?: string
          instructors?: Json | null
          phone?: string | null
          periods?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          shifts?: string[] | null
          status?: string | null
          subjects?: string[] | null
          submitted_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_school_updates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          institution: string | null
          occupation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          institution?: string | null
          occupation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          institution?: string | null
          occupation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_periods: {
        Row: {
          id: string
          period: string
          school_id: string
        }
        Insert: {
          id?: string
          period: string
          school_id: string
        }
        Update: {
          id?: string
          period?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_periods_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_shifts: {
        Row: {
          id: string
          school_id: string
          shift: string
        }
        Insert: {
          id?: string
          school_id: string
          shift: string
        }
        Update: {
          id?: string
          school_id?: string
          shift?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_shifts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_subjects: {
        Row: {
          id: string
          school_id: string
          subject: string
        }
        Insert: {
          id?: string
          school_id: string
          subject: string
        }
        Update: {
          id?: string
          school_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_subjects_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_views: {
        Row: {
          id: string
          school_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_views_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          additional_info: string | null
          contributor_name: string | null
          created_at: string | null
          email: string | null
          full_address: string
          id: string
          latitude: number
          longitude: number
          name: string
          nature: string
          neighborhood: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          additional_info?: string | null
          contributor_name?: string | null
          created_at?: string | null
          email?: string | null
          full_address: string
          id?: string
          latitude: number
          longitude: number
          name: string
          nature: string
          neighborhood: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          additional_info?: string | null
          contributor_name?: string | null
          created_at?: string | null
          email?: string | null
          full_address?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          nature?: string
          neighborhood?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
