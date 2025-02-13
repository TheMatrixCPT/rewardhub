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
      activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          points: number
          type: Database["public"]["Enums"]["activity_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          points?: number
          type: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          points?: number
          type?: Database["public"]["Enums"]["activity_type"]
          updated_at?: string
        }
        Relationships: []
      }
      announcement_reactions: {
        Row: {
          announcement_id: string
          comment: string | null
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          comment?: string | null
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reactions_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          type: string | null
          youtube_url: string | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          type?: string | null
          youtube_url?: string | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          type?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      points: {
        Row: {
          created_at: string
          id: string
          points: number
          submission_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          submission_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          submission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_registrations: {
        Row: {
          id: string
          points: number | null
          prize_id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          points?: number | null
          prize_id: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          points?: number | null
          prize_id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_registrations_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      prizes: {
        Row: {
          active: boolean | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_required: number
          registration_end: string | null
          registration_start: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_required: number
          registration_end?: string | null
          registration_start?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
          registration_end?: string | null
          registration_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          job_title: string | null
          last_name: string | null
          linkedin_profile: string | null
          phone_number: string | null
          referral_code: string | null
          referral_source: string | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          linkedin_profile?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referral_source?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_profile?: string | null
          phone_number?: string | null
          referral_code?: string | null
          referral_source?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          points_awarded: boolean | null
          referee_id: string | null
          referral_code: string
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          points_awarded?: boolean | null
          referee_id?: string | null
          referral_code: string
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          points_awarded?: boolean | null
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          activity_id: string
          admin_comment: string | null
          bonus_points: number | null
          company_tag: string | null
          created_at: string
          id: string
          linkedin_url: string | null
          mentor_tag: string | null
          post_content: string | null
          prize_id: string | null
          proof_url: string | null
          status: Database["public"]["Enums"]["submission_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          admin_comment?: string | null
          bonus_points?: number | null
          company_tag?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          mentor_tag?: string | null
          post_content?: string | null
          prize_id?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          admin_comment?: string | null
          bonus_points?: number | null
          company_tag?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          mentor_tag?: string | null
          post_content?: string | null
          prize_id?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          email: string | null
          first_name: string | null
          last_name: string | null
          points: number | null
          prize_id: string | null
          registration_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prize_registrations_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      adjust_user_points: {
        Args: {
          admin_user_id: string
          target_user_id: string
          point_adjustment: number
          adjustment_reason: string
        }
        Returns: undefined
      }
      check_submission_frequency: {
        Args: {
          p_user_id: string
          p_prize_id: string
        }
        Returns: boolean
      }
      find_similar_submissions: {
        Args: {
          check_content: string
          similarity_threshold?: number
        }
        Returns: {
          id: string
          post_content: string
          similarity: number
          created_at: string
          user_id: string
          status: Database["public"]["Enums"]["submission_status"]
        }[]
      }
      get_daily_stats: {
        Args: {
          check_date: string
        }
        Returns: {
          pending_reviews: number
          approved_today: number
          rejected_today: number
          active_users: number
        }[]
      }
      get_engagement_stats: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          company_tag: string
          mentor_tag: string
          total_submissions: number
          approved_submissions: number
          average_points: number
        }[]
      }
      get_user_rankings: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          rank: number
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      activity_type:
        | "hackathon"
        | "linkedin_post"
        | "networking_event"
        | "assessment"
        | "training"
      submission_status: "pending" | "approved" | "rejected"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
