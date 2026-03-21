-- ================================================================
-- EIP Dashboard — Initial Schema
-- Full schema with all tables, indexes, and RLS
-- ================================================================

CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  zenoti_api_url TEXT,
  zenoti_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  rooms INT DEFAULT 4,
  providers INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferred_location_id UUID REFERENCES locations(id),
  join_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2),
  duration INT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  location_id UUID REFERENCES locations(id),
  hourly_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  service_id UUID REFERENCES services(id),
  provider_id UUID REFERENCES providers(id),
  location_id UUID REFERENCES locations(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL,
  booked_by TEXT DEFAULT 'online',
  revenue NUMERIC(10,2) DEFAULT 0,
  normalized_revenue NUMERIC(10,2) DEFAULT 0,
  sale_type TEXT DEFAULT 'service',
  package_id TEXT,
  package_session TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  location_id UUID REFERENCES locations(id),
  date DATE NOT NULL,
  total NUMERIC(10,2),
  sale_type TEXT DEFAULT 'service',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, external_id)
);

CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  date DATE NOT NULL,
  revenue NUMERIC(10,2) DEFAULT 0,
  normalized_revenue NUMERIC(10,2) DEFAULT 0,
  bookings INT DEFAULT 0,
  package_bookings INT DEFAULT 0,
  no_shows INT DEFAULT 0,
  no_show_rate NUMERIC(5,2) DEFAULT 0,
  utilization_rate NUMERIC(5,2) DEFAULT 0,
  new_clients INT DEFAULT 0,
  rebooking_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, location_id, date)
);

CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'incremental' | 'full'
  status TEXT NOT NULL, -- 'running' | 'completed' | 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_synced INT DEFAULT 0,
  error_message TEXT
);

CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  location_filter TEXT NOT NULL DEFAULT 'all',
  result JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, location_filter)
);

-- Indexes
CREATE INDEX idx_appointments_workspace_date ON appointments(workspace_id, date);
CREATE INDEX idx_appointments_location ON appointments(location_id, date);
CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_daily_metrics_workspace_date ON daily_metrics(workspace_id, date);
CREATE INDEX idx_sync_log_workspace ON sync_log(workspace_id, started_at DESC);
CREATE INDEX idx_analytics_cache_workspace ON analytics_cache(workspace_id, location_filter);

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- For v1: use SUPABASE_SERVICE_KEY (bypasses RLS) for sync
-- For reads: SUPABASE_ANON_KEY with workspace_id filter
-- Future: add JWT-based policies
-- Example policy (commented for future):
-- CREATE POLICY "workspace_isolation" ON locations
--   FOR ALL USING (workspace_id = (current_setting('request.jwt.claims')::jsonb->>'workspace_id')::uuid);
