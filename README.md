# CEBECO II Outage Portal — MVP

A power-outage tracking and email-alert portal for Sogod, Cebu, in the CEBECO II
(Cebu 2 Electric Cooperative) franchise area. Public users browse scheduled and
ongoing outages and subscribe to email alerts; admins post outages through a
secure dashboard.

**This is an UNOFFICIAL project.** It is not operated by, endorsed by, or
affiliated with CEBECO II (Cebu 2 Electric Cooperative). Outage information is
curated manually and may be incomplete, delayed, or inaccurate. Always confirm
with official CEBECO II channels.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (PostgreSQL) + [Supabase JS client](https://supabase.com/docs/reference/javascript)

## Project structure

```
src/lib/supabase/   Supabase client (browser + server) and DB row types
shared/             Shared constants (MUNICIPALITIES, SOGOD_BARANGAYS) and TS types
supabase/           schema.sql (DDL) and seed.sql (reference data)
.env.example        Documented environment variables
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier is fine) — or a local PostgreSQL/PostgREST

### Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment variables

   ```bash
   cp .env.example .env
   ```

   Fill in:

   | Variable                    | Purpose                                    |
   | --------------------------- | ------------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`  | Supabase project URL                        |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) API key           |
   | `RESEND_API_KEY`            | Resend key for email alerts (Phase 4)       |

3. Create the database schema and load reference data

   Run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL Editor.

### Run

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Start the dev server       |
| `npm run build`    | Typecheck + production build |
| `npm run lint`     | Run ESLint                 |
| `npm run start`    | Start the production build |

## Status

Phase 1 (scaffold + database schema) is complete. See `TODO.md` and
`armada/REQUIREMENTS.md` for the roadmap.

## Disclaimer

This project is community-built and is provided "as is" without warranty. Use
it at your own risk and always refer to official CEBECO II communications for
outage status.