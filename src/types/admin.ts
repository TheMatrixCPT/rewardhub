
export interface DailyStats {
  pending_reviews: number;
  approved_today: number;
  rejected_today: number;
  active_users: number;
}

interface Activity {
  name: string;
  points: number;
}

interface Profile {
  email: string | null;
  company: string | null;
  first_name: string | null;
  last_name: string | null;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  user_id: string;
  activity_id: string;
  created_at: string;
  status: SubmissionStatus;
  linkedin_url: string | null;
  proof_url: string | null;
  company_tag: string | null;
  mentor_tag: string | null;
  admin_comment?: string | null;
  post_content?: string | null;
  activities?: Activity;
  profiles?: Profile;
}
