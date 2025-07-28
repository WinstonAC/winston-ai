-- ===============================================
-- WINSTON AI - PRODUCTION RLS SETUP FOR DEMO MODE
-- ===============================================
-- Run this in Supabase SQL Editor to enable demo access
-- This allows full CRUD operations for demo/testing

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Team members can view their team" ON public.teams;
DROP POLICY IF EXISTS "Team owners can update their team" ON public.teams;
DROP POLICY IF EXISTS "Users can view team campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view team leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update team leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view team templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can view team lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can create lead activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Users can view team analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can create analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own chatbot interactions" ON public.chatbot_interactions;
DROP POLICY IF EXISTS "Users can create chatbot interactions" ON public.chatbot_interactions;

-- ===============================================
-- DEMO MODE: OPEN ACCESS POLICIES
-- ===============================================

-- LEADS (Contacts) - Full access for demo
CREATE POLICY "Demo: Allow all operations on leads" ON public.leads
  FOR ALL USING (true) WITH CHECK (true);

-- USERS (Admin Panel) - Full access for demo  
CREATE POLICY "Demo: Allow all operations on users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- CAMPAIGNS (Campaigns/Analytics) - Full access for demo
CREATE POLICY "Demo: Allow all operations on campaigns" ON public.campaigns
  FOR ALL USING (true) WITH CHECK (true);

-- TEAMS - Full access for demo
CREATE POLICY "Demo: Allow all operations on teams" ON public.teams
  FOR ALL USING (true) WITH CHECK (true);

-- EMAIL TEMPLATES - Full access for demo
CREATE POLICY "Demo: Allow all operations on templates" ON public.email_templates
  FOR ALL USING (true) WITH CHECK (true);

-- LEAD ACTIVITIES - Full access for demo
CREATE POLICY "Demo: Allow all operations on activities" ON public.lead_activities
  FOR ALL USING (true) WITH CHECK (true);

-- ANALYTICS EVENTS - Full access for demo
CREATE POLICY "Demo: Allow all operations on analytics" ON public.analytics_events
  FOR ALL USING (true) WITH CHECK (true);

-- CHATBOT INTERACTIONS - Full access for demo
CREATE POLICY "Demo: Allow all operations on chatbot" ON public.chatbot_interactions
  FOR ALL USING (true) WITH CHECK (true);

-- ===============================================
-- VERIFY SETUP
-- ===============================================

-- Test read access
SELECT 'Testing leads table...' as test;
SELECT COUNT(*) as lead_count FROM public.leads;

SELECT 'Testing users table...' as test;
SELECT COUNT(*) as user_count FROM public.users;

SELECT 'Testing campaigns table...' as test;
SELECT COUNT(*) as campaign_count FROM public.campaigns;

-- Insert test data if tables are empty
INSERT INTO public.users (id, email, full_name, role, created_at) 
VALUES 
  ('demo-user-123', 'demo@winston-ai.com', 'Demo User', 'admin', NOW()),
  ('admin-user-456', 'admin@winston-ai.com', 'Winston Admin', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.leads (user_id, email, full_name, company, status, tags, created_at)
VALUES 
  ('demo-user-123', 'john@example.com', 'John Doe', 'Example Corp', 'new', ARRAY['demo', 'test'], NOW()),
  ('demo-user-123', 'jane@company.com', 'Jane Smith', 'Company Inc', 'contacted', ARRAY['qualified'], NOW()),
  ('demo-user-123', 'mike@startup.io', 'Mike Johnson', 'Startup IO', 'qualified', ARRAY['hot-lead'], NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.campaigns (user_id, name, description, status, created_at)
VALUES 
  ('demo-user-123', 'Demo Campaign', 'Sample campaign for testing', 'active', NOW()),
  ('demo-user-123', 'Welcome Series', 'Onboarding email sequence', 'draft', NOW())
ON CONFLICT DO NOTHING;

SELECT 'RLS Demo Setup Complete!' as status; 