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
      activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          points: number
          type: ActivityType
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          points?: number
          type: ActivityType
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          points?: number
          type?: ActivityType
          updated_at?: string
        }
      }
      prizes: {
        Row: {
          id: string
          name: string
          description: string | null
          points_required: number
          image_url: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          points_required: number
          image_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          points_required?: number
          image_url?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: UserRole | null
          bio: string | null
          avatar_url: string | null
          linkedin_profile: string | null
          company: string | null
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: UserRole | null
          bio?: string | null
          avatar_url?: string | null
          linkedin_profile?: string | null
          company?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: UserRole | null
          bio?: string | null
          avatar_url?: string | null
          linkedin_profile?: string | null
          company?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
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
          status: SubmissionStatus | null
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
          status?: SubmissionStatus | null
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
          status?: SubmissionStatus | null
          updated_at?: string
          user_id?: string
        }
      }
    }
    Enums: {
      activity_type: "hackathon" | "linkedin_post" | "networking_event" | "assessment" | "training"
      submission_status: "pending" | "approved" | "rejected"
      user_role: "user" | "admin"
    }
  }
}

export type ActivityType = Database["public"]["Enums"]["activity_type"]
export type SubmissionStatus = Database["public"]["Enums"]["submission_status"]
export type UserRole = Database["public"]["Enums"]["user_role"]

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]
