-- ===============================================
-- WINSTON AI - DEMO RLS FIX (COMPREHENSIVE)
-- ===============================================
-- Run this in Supabase SQL Editor to fix all RLS issues
-- This ensures full demo access to all tables

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Demo: Allow all operations on leads" ON public.leads;
DROP POLICY IF EXISTS "Demo: Allow all operations on users" ON public.users;
DROP POLICY IF EXISTS "Demo: Allow all operations on campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Demo: Allow all operations on teams" ON public.teams;
DROP POLICY IF EXISTS "Demo: Allow all operations on templates" ON public.email_templates;
DROP POLICY IF EXISTS "Demo: Allow all operations on activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Demo: Allow all operations on analytics" ON public.analytics_events;
DROP POLICY IF EXISTS "Demo: Allow all operations on chatbot" ON public.chatbot_interactions;

-- Drop any other existing policies
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
-- DEMO MODE: COMPLETE OPEN ACCESS POLICIES
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
-- INSERT DEMO DATA
-- ===============================================

-- Demo users
INSERT INTO public.users (id, email, full_name, role, created_at) 
VALUES 
  ('demo-user-123', 'demo@winston-ai.com', 'Demo User', 'admin', NOW()),
  ('admin-user-456', 'admin@winston-ai.com', 'Winston Admin', 'admin', NOW()),
  ('user-789', 'john@example.com', 'John Smith', 'user', NOW()),
  ('user-101', 'sarah@company.com', 'Sarah Johnson', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo leads with proper categorization
INSERT INTO public.leads (user_id, email, full_name, company, status, tags, created_at)
VALUES 
  ('demo-user-123', 'john@example.com', 'John Doe', 'Example Corp', 'new', ARRAY['demo', 'test'], NOW()),
  ('demo-user-123', 'jane@company.com', 'Jane Smith', 'Company Inc', 'contacted', ARRAY['qualified'], NOW()),
  ('demo-user-123', 'mike@startup.io', 'Mike Johnson', 'Startup IO', 'qualified', ARRAY['hot-lead'], NOW()),
  ('demo-user-123', 'sarah@enterprise.com', 'Sarah Wilson', 'Enterprise Corp', 'converted', ARRAY['enterprise', 'decision-maker'], NOW()),
  ('demo-user-123', 'david@tech.io', 'David Brown', 'Tech Startup', 'unqualified', ARRAY['cold'], NOW()),
  ('demo-user-123', 'emma@consulting.com', 'Emma Davis', 'Consulting Group', 'contacted', ARRAY['prospect'], NOW()),
  ('demo-user-123', 'alex@agency.com', 'Alex Chen', 'Marketing Agency', 'qualified', ARRAY['agency', 'hot'], NOW()),
  ('demo-user-123', 'lisa@saas.com', 'Lisa Rodriguez', 'SaaS Company', 'new', ARRAY['saas', 'startup'], NOW())
ON CONFLICT DO NOTHING;

-- Demo campaigns
INSERT INTO public.campaigns (user_id, name, description, status, created_at)
VALUES 
  ('demo-user-123', 'Demo Campaign', 'Sample campaign for testing', 'active', NOW()),
  ('demo-user-123', 'Welcome Series', 'Onboarding email sequence', 'draft', NOW()),
  ('demo-user-123', 'Enterprise Outreach', 'Targeting enterprise clients', 'active', NOW()),
  ('demo-user-123', 'Startup Network', 'Connecting with startups', 'completed', NOW())
ON CONFLICT DO NOTHING;

-- Demo analytics events
INSERT INTO public.analytics_events (user_id, event_type, event_data, created_at)
VALUES 
  ('demo-user-123', 'lead_created', '{"lead_id": "1", "source": "csv_upload"}', NOW()),
  ('demo-user-123', 'email_sent', '{"campaign_id": "1", "recipient_count": 150}', NOW()),
  ('demo-user-123', 'email_opened', '{"campaign_id": "1", "open_rate": 0.25}', NOW()),
  ('demo-user-123', 'lead_converted', '{"lead_id": "4", "conversion_value": 5000}', NOW())
ON CONFLICT DO NOTHING;

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

SELECT 'Testing analytics table...' as test;
SELECT COUNT(*) as analytics_count FROM public.analytics_events;

-- Show lead status distribution
SELECT 'Lead Status Distribution:' as info;
SELECT status, COUNT(*) as count FROM public.leads GROUP BY status ORDER BY count DESC;

SELECT 'RLS Demo Fix Complete!' as status; 