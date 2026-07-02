import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type AssociationCategory = {
  id: string;
  name_ar: string;
  name_en: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
};

export type SurveyAxis = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  indicators?: SurveyIndicator[];
};

export type SurveyIndicator = {
  id: string;
  axis_id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  description: string | null;
  weight: number;
  measurement_type: string;
  sort_order: number;
};

export type Association = {
  id: string;
  user_id: string;
  name: string;
  license_number: string | null;
  category_id: string | null;
  establishment_year: number | null;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  employee_count: number | null;
  volunteer_count: number | null;
  beneficiary_count: number | null;
  annual_budget: number | null;
  status: string;
  survey_completed: boolean;
  survey_completed_at: string | null;
  created_at: string;
  updated_at: string;
  category?: AssociationCategory;
};

export type SurveyResponse = {
  id: string;
  association_id: string;
  year: number;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  overall_score: number | null;
  created_at: string;
  updated_at: string;
  association?: Association;
  scores?: IndicatorScore[];
};

export type IndicatorScore = {
  id: string;
  response_id: string;
  indicator_id: string;
  score: number;
  notes: string | null;
  evidence: string | null;
  indicator?: SurveyIndicator;
};

export type AnalysisResult = {
  id: string;
  association_id: string;
  response_id: string | null;
  analysis_type: string;
  data: Record<string, unknown>;
  created_at: string;
};
