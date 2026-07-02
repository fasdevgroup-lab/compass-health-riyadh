/*
# COMPASS Health - المرصد الوطني لقياس احتياجات الجمعيات الصحية

1. جداول المرجع (Reference Tables):
   - `association_categories`: تصنيفات الجمعيات الصحية (السرطان، السكري، القلب، إلخ)
   - `survey_axes`: محاور الدراسة العشرة
   - `survey_indicators`: المؤشرات التفصيلية لكل محور (150+ مؤشر)

2. جداول البيانات (Data Tables):
   - `associations`: الجمعيات الصحية المسجلة
   - `survey_responses`: استجابات الاستبيان لكل جمعية
   - `indicator_scores`: درجات كل مؤشر للاستجابة
   - `analysis_results`: نتائج التحليلات (SWOT, PESTEL, Gap, إلخ)

3. الأمان:
   - تفعيل RLS على جميع الجداول
   - سياسات للقراءة والكتابة للمستخدمين المسجلين
   - كل جمعية ترى بياناتها فقط
*/

-- تصنيفات الجمعيات الصحية
CREATE TABLE IF NOT EXISTS association_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  description text,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- محاور الدراسة
CREATE TABLE IF NOT EXISTS survey_axes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  description text,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- مؤشرات القياس
CREATE TABLE IF NOT EXISTS survey_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  axis_id uuid NOT NULL REFERENCES survey_axes(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text,
  description text,
  weight decimal DEFAULT 1.0,
  measurement_type text DEFAULT 'scale', -- scale, yes_no, percentage, text
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- الجمعيات الصحية
CREATE TABLE IF NOT EXISTS associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  license_number text UNIQUE,
  category_id uuid REFERENCES association_categories(id),
  establishment_year int,
  city text DEFAULT 'الرياض',
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  description text,
  employee_count int,
  volunteer_count int,
  beneficiary_count int,
  annual_budget decimal,
  status text DEFAULT 'pending', -- pending, active, approved
  survey_completed boolean DEFAULT false,
  survey_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- استجابات الاستبيان
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  year int NOT NULL DEFAULT EXTRACT(year FROM now()),
  status text DEFAULT 'draft', -- draft, submitted, reviewed, approved
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_notes text,
  overall_score decimal,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(association_id, year)
);

-- درجات المؤشرات
CREATE TABLE IF NOT EXISTS indicator_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  indicator_id uuid NOT NULL REFERENCES survey_indicators(id) ON DELETE CASCADE,
  score decimal NOT NULL, -- 0-5 or 0-100 depending on measurement type
  notes text,
  evidence text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(response_id, indicator_id)
);

-- نتائج التحليلات
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  response_id uuid REFERENCES survey_responses(id) ON DELETE CASCADE,
  analysis_type text NOT NULL, -- swot, pestel, gap, priority, maturity, readiness
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE association_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_axes ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- سياسات الجداول المرجعية (للقراءة للجميع، الكتابة للمسؤولين)
DROP POLICY IF EXISTS "anon_read_categories" ON association_categories;
CREATE POLICY "anon_read_categories" ON association_categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_axes" ON survey_axes;
CREATE POLICY "anon_read_axes" ON survey_axes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_indicators" ON survey_indicators;
CREATE POLICY "anon_read_indicators" ON survey_indicators FOR SELECT TO anon, authenticated USING (true);

-- سياسات الجمعيات
DROP POLICY IF EXISTS "associations_select_own" ON associations;
CREATE POLICY "associations_select_own" ON associations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "associations_insert_own" ON associations;
CREATE POLICY "associations_insert_own" ON associations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "associations_update_own" ON associations;
CREATE POLICY "associations_update_own" ON associations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "associations_delete_own" ON associations;
CREATE POLICY "associations_delete_own" ON associations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- سياسات استجابات الاستبيان
DROP POLICY IF EXISTS "responses_select_own" ON survey_responses;
CREATE POLICY "responses_select_own" ON survey_responses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM associations WHERE associations.id = survey_responses.association_id AND associations.user_id = auth.uid()));

DROP POLICY IF EXISTS "responses_insert_own" ON survey_responses;
CREATE POLICY "responses_insert_own" ON survey_responses FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM associations WHERE associations.id = survey_responses.association_id AND associations.user_id = auth.uid()));

DROP POLICY IF EXISTS "responses_update_own" ON survey_responses;
CREATE POLICY "responses_update_own" ON survey_responses FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM associations WHERE associations.id = survey_responses.association_id AND associations.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM associations WHERE associations.id = survey_responses.association_id AND associations.user_id = auth.uid()));

DROP POLICY IF EXISTS "responses_delete_own" ON survey_responses;
CREATE POLICY "responses_delete_own" ON survey_responses FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM associations WHERE associations.id = survey_responses.association_id AND associations.user_id = auth.uid()));

-- سياسات درجات المؤشرات
DROP POLICY IF EXISTS "scores_select_own" ON indicator_scores;
CREATE POLICY "scores_select_own" ON indicator_scores FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM survey_responses r JOIN associations a ON a.id = r.association_id WHERE r.id = indicator_scores.response_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "scores_insert_own" ON indicator_scores;
CREATE POLICY "scores_insert_own" ON indicator_scores FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM survey_responses r JOIN associations a ON a.id = r.association_id WHERE r.id = indicator_scores.response_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "scores_update_own" ON indicator_scores;
CREATE POLICY "scores_update_own" ON indicator_scores FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM survey_responses r JOIN associations a ON a.id = r.association_id WHERE r.id = indicator_scores.response_id AND a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM survey_responses r JOIN associations a ON a.id = r.association_id WHERE r.id = indicator_scores.response_id AND a.user_id = auth.uid()));

DROP POLICY IF EXISTS "scores_delete_own" ON indicator_scores;
CREATE POLICY "scores_delete_own" ON indicator_scores FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM survey_responses r JOIN associations a ON a.id = r.association_id WHERE r.id = indicator_scores.response_id AND a.user_id = auth.uid()));

-- سياسات نتائج التحليلات
DROP POLICY IF EXISTS "analysis_select_own" ON analysis_results;
CREATE POLICY "analysis_select_own" ON analysis_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM associations WHERE associations.id = analysis_results.association_id AND associations.user_id = auth.uid()));

DROP POLICY IF EXISTS "analysis_insert_own" ON analysis_results;
CREATE POLICY "analysis_insert_own" ON analysis_results FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM associations WHERE associations.id = analysis_results.association_id AND associations.user_id = auth.uid()));

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_associations_user ON associations(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_association ON survey_responses(association_id);
CREATE INDEX IF NOT EXISTS idx_scores_response ON indicator_scores(response_id);
CREATE INDEX IF NOT EXISTS idx_scores_indicator ON indicator_scores(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicators_axis ON survey_indicators(axis_id);
