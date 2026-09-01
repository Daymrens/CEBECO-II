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
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) (password hashing) + [jose](https://www.npmjs.com/package/jose) (signed JWT sessions)

## Project structure

```
src/lib/auth/        Password hashing, JWT sign/verify, session cookie, requireAdmin guard
src/lib/db/          Data-access layer: adapter interface + JSON-file store (default) + Postgres store
src/lib/outages/     Outage payload validation (municipality/barangay/time/date)
src/app/api/         Route handlers (auth, admin, outages)
src/app/admin/       Admin UI (login, dashboard, outages CRUD, audit logs)
shared/              Shared constants (MUNICIPALITIES, SOGOD_BARANGAYS) and TS types
supabase/            schema.sql (DDL, incl. audit_logs) and seed.sql (reference data)
scripts/             seed-admin.ts (creates the default admin account)
.env.example         Documented environment variables
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

   | Variable                       | Purpose                                                                |
   | ------------------------------ | ---------------------------------------------------------------------- |
   | `AUTH_SECRET`                  | Secret signing admin session JWTs (HS256). **Required in production.** |
   | `DATABASE_URL`                 | Postgres connection string (activates the Postgres store)              |
   | `DATA_FILE`                    | JSON-store file path override (default `data/db.json`)                 |
   | `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL (not needed for the JSON-file store)              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon (public) API key                                         |
   | `RESEND_API_KEY`               | Resend key for email alerts (Phase 4)                                  |

   Generate a strong `AUTH_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Create the database schema and load reference data

   Run `supabase/schema.sql` then `supabase/seed.sql` in the Supabase SQL Editor
   (a `DATABASE_URL` + live Postgres is only required when using that store).

### Seed the default admin

```bash
npm run seed:admin
```

Default credentials (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`):

```
email:    admin@cebeco.example
password: admin1234
```

**Change this password before any real use.**

### Run

```bash
npm run dev
```

Open http://localhost:3000 — public home page at `/`, admin login at `/admin/login`.

## Data storage — default vs Postgres

This app is built to run **with zero external services** so it is testable in a
sandbox:

- **Default: JSON-file store** (`src/lib/db/json-store.ts`). All tables
  (users, outages, subscribers, alert_logs, audit_logs) persist to one JSON
  file (`data/db.json` by default) that mirrors the Postgres schema. The
  adapter is selected in `src/lib/db/index.ts`.
- **Postgres store** (`src/lib/db/postgres-store.ts`). Set `DATABASE_URL` (and
  create the schema via `supabase/schema.sql`) to switch. Queries mirror the
  JSON-file store exactly.

Both expose the same `DBAdapter` interface; no route/UI code changes are needed
to move between them.

## Auth (real, not a passcode)

- Passwords are hashed with **bcrypt** (`bcryptjs`, 12 rounds). Plaintext is
  never stored.
- Sessions are **signed JWTs** (`jose`, HS256, `AUTH_SECRET`) in an httpOnly,
  SameSite=lax cookie (`cebeco_admin_session`, 7-day expiry).
- Every admin API route runs the `requireAdmin` guard
  (`src/lib/auth/require-admin.ts`): verifies the JWT **and** that the user
  still exists and is `is_admin` in the DB.
- `/admin/*` pages (except login) are protected on the server via the
  `(dashboard)` layout, which redirects unauthenticated users to `/admin/login`.

## API

| Method | Route                      | Auth    | Description                              |
| ------ | -------------------------- | ------- | ---------------------------------------- |
| POST   | `/api/auth/login`          | public  | Verify email+password, set session cookie|
| POST   | `/api/auth/logout`         | public  | Clear session cookie                     |
| GET    | `/api/admin/me`            | admin   | Current admin user or 401                |
| GET    | `/api/admin/stats`         | admin   | Total/upcoming outages, subscribers, alerts sent |
| GET    | `/api/admin/audit-logs`    | admin   | Recent audit entries                     |
| GET    | `/api/outages`             | public  | List (filters: municipality, barangay, range=day\|week\|all) |
| GET    | `/api/outages/:id`         | public  | Single outage                            |
| POST   | `/api/outages`             | admin   | Create outage (writes audit log)         |
| PATCH  | `/api/outages/:id`         | admin   | Update outage; `status=cancelled` runs cancel audit log |
| DELETE | `/api/outages/:id`         | admin   | Delete outage (writes audit log)         |

Every admin mutation writes a row to `audit_logs` (`supabase/schema.sql`):
actor_user_id, action (`create|update|cancel|delete`), target_type, target_id,
details (before/after), created_at.

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the dev server           |
| `npm run build`    | Typecheck + production build   |
| `npm run lint`     | Run ESLint                     |
| `npm run start`    | Start the production build     |
| `npm run seed:admin`| Create/re-create the admin    |

## Status

Phase 1 (scaffold + database schema) and Phase 2 (admin auth + dashboard) are
complete. See `TODO.md` and `armada/REQUIREMENTS.md` for the roadmap.

## Disclaimer

This project is community-built and is provided "as is" without warranty. Use
it at your own risk and always refer to official CEBECO II communications for
outage status.