-- Add user roles system
-- Roles: admin (initiative owner), supervisor (oversight), consultant (advisory), association (regular user)

CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'consultant', 'association');

-- Create initiative_users table for initiative management
CREATE TABLE initiative_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'association',
  department TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ,
  UNIQUE(email)
);

-- Add index
CREATE INDEX idx_initiative_users_role ON initiative_users(role);
CREATE INDEX idx_initiative_users_user_id ON initiative_users(user_id);

-- Enable RLS
ALTER TABLE initiative_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for initiative_users
CREATE POLICY "select_my_profile" ON initiative_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR 
    user_id IN (SELECT user_id FROM initiative_users WHERE role IN ('admin', 'supervisor', 'consultant')));

CREATE POLICY "insert_own_profile" ON initiative_users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile" ON initiative_users FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_activity_admin" ON activity_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM initiative_users WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'consultant'))
  );

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- Add association_id to initiative_users for linking initiative staff to specific associations
ALTER TABLE initiative_users ADD COLUMN managed_associations UUID[] DEFAULT '{}';

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM initiative_users WHERE user_id = auth.uid() LIMIT 1;
  RETURN COALESCE(v_role, 'association');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
