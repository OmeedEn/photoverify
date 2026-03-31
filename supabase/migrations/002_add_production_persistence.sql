-- =============================================
-- Production persistence for Vercel deployments
-- =============================================

create table if not exists public.image_fingerprints (
  id uuid primary key,
  exact_hash text not null,
  perceptual_hash text not null,
  uploaded_at timestamptz default now() not null,
  source text,
  reported_as_scam boolean default false not null,
  match_count integer default 0 not null
);

create index if not exists idx_image_fingerprints_exact_hash
  on public.image_fingerprints (exact_hash);

create index if not exists idx_image_fingerprints_perceptual_hash
  on public.image_fingerprints (perceptual_hash);

create index if not exists idx_image_fingerprints_reported_as_scam
  on public.image_fingerprints (reported_as_scam);

alter table public.image_fingerprints enable row level security;

create table if not exists public.ticket_codes (
  code text primary key,
  check_count integer default 1 not null,
  first_seen_at timestamptz default now() not null,
  last_seen_at timestamptz default now() not null
);

alter table public.ticket_codes enable row level security;

create table if not exists public.community_reports (
  id uuid primary key,
  category text not null,
  platform text not null,
  description text not null,
  reported_at timestamptz default now() not null,
  upvotes integer default 0 not null
);

create index if not exists idx_community_reports_reported_at
  on public.community_reports (reported_at desc);

alter table public.community_reports enable row level security;

-- Seed data removed for production. Add real community reports through the app.
