-- =============================================
-- PhotoVerify: Scans & Subscriptions tables
-- =============================================

-- Scans table: records every verification scan
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_hash text not null,
  trust_score integer not null,
  verdict text not null,
  created_at timestamptz default now() not null
);

-- Index for fast monthly scan count queries
create index if not exists idx_scans_user_created
  on public.scans (user_id, created_at desc);

-- Subscriptions table: tracks Stripe subscription state
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  plan text not null default 'pro',
  current_period_end timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists idx_subscriptions_user
  on public.subscriptions (user_id);

create unique index if not exists idx_subscriptions_stripe_sub
  on public.subscriptions (stripe_subscription_id);

-- =============================================
-- Row-Level Security
-- =============================================

alter table public.scans enable row level security;
alter table public.subscriptions enable row level security;

-- Scans: users can only read their own scans
create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

-- Scans: users can insert their own scans (via API)
create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

-- Subscriptions: users can only read their own subscription
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Subscriptions: only service role can insert/update (via webhook)
-- The Stripe webhook handler uses the service role key, so no user-facing
-- insert/update policies are needed. The service role bypasses RLS.
