export interface Prize {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  deadline?: string;
  registration_start?: string;
  registration_end?: string;
}

export interface PrizeRegistration {
  prize_id: string;
  points: number;
}