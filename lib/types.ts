export interface Business {
  id: number;
  place_id: string;
  name: string;
  phone: string | null;
  website: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  rating: number;
  reviews_count: number;
  category: string | null;
  open_now: boolean;
  google_maps_url: string | null;
  lat: number | null;
  lng: number | null;
  ai_score: number;
  created_at: string;
}

export interface SearchRequest {
  query: string;
  city?: string;
  state?: string;
  radius?: number;
  pincode?: string;
  category?: string;
  min_rating?: number;
  has_website?: boolean;
  has_phone?: boolean;
  has_email?: boolean;
  open_now?: boolean;
  page?: number;
  page_size?: number;
}

export interface SearchResultResponse {
  results: Business[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  query_summary: string;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface SavedLead {
  id: number;
  user_id: number;
  business_id: number;
  status: 'New' | 'Contacted' | 'Interested' | 'Not Interested' | 'Closed';
  is_favorite: boolean;
  list_name: string;
  created_at: string;
  updated_at: string;
  business: Business;
  notes: Note[];
  tags: Tag[];
}

export interface LeadList {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  lead_count: number;
}

export interface AIScoreResponse {
  business_id: string;
  score: number;
  grade: string;
  key_strengths: string[];
  improvement_areas: string[];
  suggested_outreach_angle: string;
}

export interface AdminStats {
  total_users: number;
  total_searches: number;
  total_saved_leads: number;
  total_contacted: number;
  conversion_rate: number;
  avg_latency_ms: number;
  api_call_count: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}
