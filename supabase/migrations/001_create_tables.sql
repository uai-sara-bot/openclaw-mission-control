-- OpenClaw Mission Control Database Schema
-- Run this in Supabase Dashboard SQL Editor: https://advxcrconarkrhfzstlf.supabase.co

-- Agents table (reflects real OpenClaw agents)
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  model TEXT,
  status TEXT DEFAULT 'idle' CHECK (status IN ('working','idle','error','offline')),
  current_task TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  machine TEXT,
  channel TEXT,
  instructions TEXT,
  hard_rules TEXT[],
  token_usage_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table (created by agents or manually)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('recurring','backlog','inprogress','review','done')),
  assignee TEXT DEFAULT 'henry',
  project_tag TEXT,
  tag_color TEXT DEFAULT '#3b82f6',
  source TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity events (every agent action)
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT,
  agent_name TEXT,
  action TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  details TEXT,
  event_type TEXT CHECK (event_type IN ('start','progress','end','error','tool_use','thinking')),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory entries (from OpenClaw memory files)
CREATE TABLE IF NOT EXISTS memory_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  content TEXT,
  word_count INTEGER,
  entry_type TEXT DEFAULT 'daily',
  agent_name TEXT DEFAULT 'main',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, agent_name)
);

-- Documents (created by agents)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  format TEXT DEFAULT 'markdown',
  created_by TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cron jobs (from OpenClaw config)
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  schedule TEXT,
  description TEXT,
  agent_name TEXT,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost tracking
CREATE TABLE IF NOT EXISTS costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT,
  model TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  run_id TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals (items needing sign-off)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requesting_agent TEXT,
  context TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content pipeline
CREATE TABLE IF NOT EXISTS content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'ideas' CHECK (stage IN ('ideas','scripting','thumbnail','filming','editing','published')),
  assignee TEXT,
  content_type TEXT DEFAULT 'video',
  tag TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('active','planning','running','completed','paused')),
  description TEXT,
  progress INTEGER DEFAULT 0,
  assignee TEXT,
  priority TEXT DEFAULT 'medium',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT CHECK (type IN ('task','approval','error','cost','info','agent')),
  title TEXT NOT NULL,
  message TEXT,
  agent_name TEXT,
  read BOOLEAN DEFAULT false,
  run_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- People/CRM
CREATE TABLE IF NOT EXISTS people (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT,
  role TEXT,
  email TEXT,
  tags TEXT[],
  bio TEXT,
  category TEXT DEFAULT 'external',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS people_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('call','email','meeting','note')),
  date DATE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_events;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable RLS (Row Level Security) - service role bypasses all
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_interactions ENABLE ROW LEVEL SECURITY;

-- Allow anon read for dashboard (service key bypasses RLS anyway)
CREATE POLICY "Allow anon read" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON activity_events FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON memory_entries FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON cron_jobs FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON costs FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON approvals FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON content_items FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON people FOR SELECT USING (true);
CREATE POLICY "Allow anon read" ON people_interactions FOR SELECT USING (true);
