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
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          }
        ]
      }
      prizes: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          points_required: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          points_required: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          points_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          job_title: string | null
          linkedin_profile: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id: string
          job_title?: string | null
          linkedin_profile?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          linkedin_profile?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
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
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
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