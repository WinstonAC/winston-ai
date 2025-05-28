-- Winston AI Database Schema
-- Run this in Supabase SQL Editor to set up minimum required tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'manager', 'member')) default 'member',
  team_id uuid,
  plan text check (plan in ('free', 'pro', 'enterprise')) default 'free',
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Teams table
create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  owner_id uuid references public.users(id) on delete cascade,
  plan text check (plan in ('free', 'pro', 'enterprise')) default 'free',
  settings jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add foreign key for team_id in users table
alter table public.users add constraint users_team_id_fkey 
  foreign key (team_id) references public.teams(id) on delete set null;

-- Campaigns table
create table public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  description text,
  status text check (status in ('draft', 'active', 'paused', 'completed')) default 'draft',
  template_id uuid,
  target_audience jsonb default '{}',
  schedule jsonb default '{}',
  metrics jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Email templates table
create table public.email_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  subject text not null,
  content text not null,
  variables jsonb default '[]',
  is_default boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Leads table
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  title text,
  phone text,
  status text check (status in ('new', 'contacted', 'qualified', 'unqualified', 'converted')) default 'new',
  score integer default 0,
  tags text[] default '{}',
  notes text,
  custom_fields jsonb default '{}',
  last_contacted timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Lead activities table
create table public.lead_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  type text not null check (type in ('email_sent', 'email_opened', 'email_clicked', 'call_made', 'meeting_scheduled', 'note_added', 'status_changed')),
  description text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Analytics events table
create table public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Chatbot interactions table
create table public.chatbot_interactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  session_id text not null,
  message text not null,
  response text not null,
  context jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.campaigns enable row level security;
alter table public.email_templates enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.analytics_events enable row level security;
alter table public.chatbot_interactions enable row level security;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Teams policies
create policy "Team members can view their team" on public.teams
  for select using (
    id in (
      select team_id from public.users where id = auth.uid()
    )
  );

create policy "Team owners can update their team" on public.teams
  for update using (owner_id = auth.uid());

-- Campaigns policies
create policy "Users can view team campaigns" on public.campaigns
  for select using (
    team_id in (
      select team_id from public.users where id = auth.uid()
    )
  );

create policy "Users can create campaigns" on public.campaigns
  for insert with check (user_id = auth.uid());

create policy "Users can update own campaigns" on public.campaigns
  for update using (user_id = auth.uid());

create policy "Users can delete own campaigns" on public.campaigns
  for delete using (user_id = auth.uid());

-- Email templates policies
create policy "Users can view team templates" on public.email_templates
  for select using (
    team_id in (
      select team_id from public.users where id = auth.uid()
    )
  );

create policy "Users can create templates" on public.email_templates
  for insert with check (user_id = auth.uid());

create policy "Users can update own templates" on public.email_templates
  for update using (user_id = auth.uid());

-- Leads policies
create policy "Users can view team leads" on public.leads
  for select using (
    team_id in (
      select team_id from public.users where id = auth.uid()
    )
  );

create policy "Users can create leads" on public.leads
  for insert with check (user_id = auth.uid());

create policy "Users can update team leads" on public.leads
  for update using (
    team_id in (
      select team_id from public.users where id = auth.uid()
    )
  );

-- Lead activities policies
create policy "Users can view team lead activities" on public.lead_activities
  for select using (
    lead_id in (
      select id from public.leads where team_id in (
        select team_id from public.users where id = auth.uid()
      )
    )
  );

create policy "Users can create lead activities" on public.lead_activities
  for insert with check (user_id = auth.uid());

-- Analytics events policies
create policy "Users can view team analytics" on public.analytics_events
  for select using (
    team_id in (
      select team_id from public.users where id = auth.uid()
    )
  );

create policy "Users can create analytics events" on public.analytics_events
  for insert with check (user_id = auth.uid());

-- Chatbot interactions policies
create policy "Users can view own chatbot interactions" on public.chatbot_interactions
  for select using (user_id = auth.uid());

create policy "Users can create chatbot interactions" on public.chatbot_interactions
  for insert with check (user_id = auth.uid());

-- Functions and Triggers

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to relevant tables
create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();

create trigger update_teams_updated_at before update on public.teams
  for each row execute procedure public.update_updated_at_column();

create trigger update_campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.update_updated_at_column();

create trigger update_email_templates_updated_at before update on public.email_templates
  for each row execute procedure public.update_updated_at_column();

create trigger update_leads_updated_at before update on public.leads
  for each row execute procedure public.update_updated_at_column();

-- Indexes for better performance
create index idx_users_team_id on public.users(team_id);
create index idx_users_email on public.users(email);
create index idx_campaigns_user_id on public.campaigns(user_id);
create index idx_campaigns_team_id on public.campaigns(team_id);
create index idx_campaigns_status on public.campaigns(status);
create index idx_leads_campaign_id on public.leads(campaign_id);
create index idx_leads_team_id on public.leads(team_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_email on public.leads(email);
create index idx_lead_activities_lead_id on public.lead_activities(lead_id);
create index idx_lead_activities_type on public.lead_activities(type);
create index idx_analytics_events_user_id on public.analytics_events(user_id);
create index idx_analytics_events_team_id on public.analytics_events(team_id);
create index idx_analytics_events_type on public.analytics_events(event_type);
create index idx_chatbot_interactions_user_id on public.chatbot_interactions(user_id);
create index idx_chatbot_interactions_session on public.chatbot_interactions(session_id);

-- Insert default email templates
insert into public.email_templates (id, name, subject, content, is_default, user_id, team_id)
values 
  (uuid_generate_v4(), 'Welcome Email', 'Welcome to {{company_name}}!', 
   'Hi {{first_name}},\n\nWelcome to {{company_name}}! We''re excited to have you on board.\n\nBest regards,\n{{sender_name}}', 
   true, null, null),
  (uuid_generate_v4(), 'Follow Up', 'Following up on our conversation', 
   'Hi {{first_name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nLet me know if you have any questions!\n\nBest,\n{{sender_name}}', 
   true, null, null),
  (uuid_generate_v4(), 'Meeting Request', 'Let''s schedule a meeting', 
   'Hi {{first_name}},\n\nI''d love to schedule a brief meeting to discuss how we can help {{company_name}}.\n\nAre you available for a 15-minute call this week?\n\nBest,\n{{sender_name}}', 
   true, null, null);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated; 