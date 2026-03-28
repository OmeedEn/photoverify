# TrustLens

TrustLens is a Next.js 14 app for verifying marketplace photos and tickets. It uses Supabase for auth and persistent production data, optional reverse image search APIs for broader image matching, and Stripe for paid upgrades.

## Stack

- Next.js 14 App Router
- Supabase Auth + Postgres
- Stripe Checkout + webhook sync
- `sharp` + `jsQR` for ticket/image processing

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the env template and fill it in:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
npm run dev
```

## Required environment variables

These are the variables you should configure in Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional but recommended:

- `TINEYE_API_KEY`
- `SERPAPI_KEY`

Required only if you want billing:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

## Supabase setup

Run both SQL migrations in `supabase/migrations` against your Supabase project:

- `001_create_tables.sql`
- `002_add_production_persistence.sql`

The second migration adds the durable production tables that Vercel needs for:

- image fingerprint matching
- ticket-code duplicate tracking
- community scam reports/upvotes

In Supabase Auth, set:

- Site URL: your Vercel production URL
- Redirect URL: `https://your-domain.com/auth/callback`

If you use Google auth, configure the provider inside Supabase and add the same callback URL there as well.

## Vercel deployment

1. Import this repository into Vercel.
2. Set the root directory to `photo-verify` if you import from a parent repo.
3. Add the environment variables from `.env.example`.
4. Deploy.

The app uses the default Next.js Vercel build command:

```bash
npm run build
```

## Stripe notes

If you enable billing:

- create a recurring price in Stripe and set `STRIPE_PRICE_ID`
- point your Stripe webhook to `https://your-domain.com/api/webhooks/stripe`
- subscribe to:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## What is deployed

Vercel deploys the Next.js app under `src/`. The `extension/` folder is not part of the Vercel deployment; that remains your separate Chrome extension artifact.
