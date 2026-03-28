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

insert into public.community_reports (id, category, platform, description, reported_at, upvotes)
values
  (
    '4f85ef5e-6834-4a19-9b8a-3da6a8351c11',
    'Gaming',
    'Facebook Marketplace',
    'Same PS5 photo used across 3 different listings in different cities. Seller asked for Zelle payment only.',
    now() - interval '2 hours',
    24
  ),
  (
    'fd728eb1-7453-4561-9af7-3177dc88fd26',
    'Electronics',
    'OfferUp',
    'Stock photo of AirPods Pro being used as a real listing. Image traced back to Apple''s website.',
    now() - interval '5 hours',
    18
  ),
  (
    'c992494e-a8b1-4ee0-bf38-c6ff4d88792d',
    'Tickets',
    'Reddit',
    'Concert ticket with duplicate barcode reported by 4 different buyers in the same city.',
    now() - interval '8 hours',
    42
  ),
  (
    'd78f7d35-0a4b-4b6a-90f2-503be8c15d02',
    'Electronics',
    'Facebook Marketplace',
    'iPhone 15 Pro listing using photos pulled directly from an Amazon product page.',
    now() - interval '14 hours',
    31
  ),
  (
    'f4acc0cb-f411-4a03-bf4e-d500b11d54b2',
    'Designer Goods',
    'OfferUp',
    'Designer bag listing using photos stolen from a Poshmark seller. Same background and angle.',
    now() - interval '20 hours',
    15
  ),
  (
    'b4c18877-c81d-4741-b987-96e5f2fcb328',
    'Tickets',
    'Facebook Marketplace',
    'Taylor Swift tickets - same screenshot being sold in 8 different cities. Identical barcode visible.',
    now() - interval '26 hours',
    87
  )
on conflict (id) do nothing;
