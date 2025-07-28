-- Demo Mode RLS Policies for Winston AI
-- This makes all tables publicly accessible for demo purposes
-- Run this in Supabase SQL Editor for demo/testing

-- Drop existing restrictive policies
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

-- Create open demo policies
CREATE POLICY "Demo: Allow all operations on users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on teams" ON public.teams
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on campaigns" ON public.campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on leads" ON public.leads
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on templates" ON public.email_templates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on activities" ON public.lead_activities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on analytics" ON public.analytics_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Demo: Allow all operations on chatbot" ON public.chatbot_interactions
  FOR ALL USING (true) WITH CHECK (true);

-- Ensure contacts table exists (using leads table)
-- If you need a dedicated contacts table:
/*
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  company text,
  tags text[],
  source text,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Demo: Allow all operations on contacts" ON public.contacts
  FOR ALL USING (true) WITH CHECK (true);
*/ 