CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('agent', 'manager', 'reviewer')) DEFAULT 'agent',
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  floor INTEGER,
  market_rent DECIMAL(10,2),
  sqft INTEGER,
  unit_code TEXT,
  status TEXT CHECK (status IN ('available', 'occupied', 'notice', 'down')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profession TEXT,
  num_vehicles INTEGER DEFAULT 0,
  source TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tour_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_type TEXT,
  unit_number TEXT,
  market_rent DECIMAL(10,2),
  concession DECIMAL(10,2) DEFAULT 0,
  concession_weeks INTEGER DEFAULT 0,
  effective_rent DECIMAL(10,2),
  budget DECIMAL(10,2),
  variance DECIMAL(10,2),
  comps_toured INTEGER DEFAULT 0,
  desired_term TEXT,
  estimated_move_in DATE,
  status TEXT CHECK (status IN ('hot', 'warm', 'cold', 'applied', 'not_interested')) DEFAULT 'warm',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  unit_type TEXT,
  unit_number TEXT,
  market_rent DECIMAL(10,2),
  pipeline_stage TEXT CHECK (pipeline_stage IN (
    'applied', 'screening', 'approved', 'lease_sent', 'lease_executed', 'move_in_scheduled'
  )) DEFAULT 'applied',
  app_submitted_date DATE,
  approval_date DATE,
  lease_execution_date DATE,
  lease_execution_target DATE,
  move_in_date DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rent_floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_code TEXT NOT NULL,
  min_gross_rent DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  label TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  daily_digest_enabled BOOLEAN DEFAULT true,
  daily_digest_time TEXT DEFAULT '18:00',
  weekly_report_enabled BOOLEAN DEFAULT true,
  weekly_report_day TEXT DEFAULT 'monday',
  pipeline_stall_days INTEGER DEFAULT 5,
  recipient_emails TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
