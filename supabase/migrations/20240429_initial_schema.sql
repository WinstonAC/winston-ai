-- Create users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create campaigns table
create table public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'draft',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  budget decimal(10,2),
  target_audience jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create campaign_analytics table
create table public.campaign_analytics (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  date date not null,
  impressions integer default 0,
  clicks integer default 0,
  conversions integer default 0,
  spend decimal(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(campaign_id, date)
);

-- Create indexes
create index campaigns_user_id_idx on public.campaigns(user_id);
create index campaign_analytics_campaign_id_idx on public.campaign_analytics(campaign_id);
create index campaign_analytics_date_idx on public.campaign_analytics(date);

-- Set up Row Level Security policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can view their own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can create their own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

create policy "Users can view analytics for their campaigns"
  on public.campaign_analytics for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_analytics.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_campaigns_updated_at
  before update on public.campaigns
  for each row
  execute function public.handle_updated_at();

create trigger handle_campaign_analytics_updated_at
  before update on public.campaign_analytics
  for each row
  execute function public.handle_updated_at(); 