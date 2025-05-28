-- Create minimum tables for Winston AI
-- Run this once in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Campaigns
create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  status text check (status in ('draft', 'active', 'paused')),
  created_at timestamp with time zone default now()
);

-- Leads
create table leads (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  email text not null,
  status text check (status in ('new', 'contacted', 'qualified', 'unqualified')),
  last_contacted timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table campaigns enable row level security;
alter table leads enable row level security;

-- Basic RLS policies (optional - remove if you want open access for MVP)
create policy "Enable read access for all users" on users for select using (true);
create policy "Enable insert for all users" on users for insert with check (true);
create policy "Enable update for all users" on users for update using (true);

create policy "Enable read access for all users" on campaigns for select using (true);
create policy "Enable insert for all users" on campaigns for insert with check (true);
create policy "Enable update for all users" on campaigns for update using (true);

create policy "Enable read access for all users" on leads for select using (true);
create policy "Enable insert for all users" on leads for insert with check (true);
create policy "Enable update for all users" on leads for update using (true);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated; 