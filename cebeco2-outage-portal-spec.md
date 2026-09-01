# CEBECO II Outage Portal — Sogod, Cebu
### Full-Stack Specification (Backend, Frontend, Features)

> Unofficial community project. Not affiliated with CEBECO II. Outage data sourced from CEBECO II's official Facebook page and/or manual admin entry.

---

## 1. Overview

A power-outage tracking and alert portal scoped to **Sogod, Cebu**, under the **CEBECO II** franchise area. Public users can browse scheduled/ongoing outages and their affected sitios/barangays; admins can post outages manually or pull them in from CEBECO II's Facebook posts. Registered users get notified when an outage affects their area.

**Coverage scope (CEBECO II franchise area, for filtering/expansion):**
Cities: Bogo City (CEBECO II main office), Danao City
Municipalities: Borbon, Carmen, Catmon, Compostela, Daanbantayan, Medellin, San Remigio, **Sogod (primary/default)**, Tabogon, Tabuelan, Tuburan

MVP ships with Sogod's barangays fully populated; other municipalities are structurally supported but empty at launch.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) + Tailwind CSS | Fast dev, matches the VECO demo's component style |
| Backend | Node.js + Express (or Next.js API routes if you want one repo) | Simple REST API, easy to host |
| Database | PostgreSQL (Supabase or Neon free tier) | Relational fit for outages ↔ areas ↔ subscribers; Supabase also gives free auth + storage |
| Auth (admin) | Supabase Auth or simple JWT + bcrypt passcode | Matches demo's passcode-gate pattern, but real hashing |
| Email delivery | Resend or Supabase's built-in email / Mailgun free tier | Actual (non-simulated) alert emails |
| Facebook ingestion | Meta Graph API (Page Public Content Access) or scheduled scraper + manual review queue | FB restricts scraping; Graph API access requires app review, so plan for a **manual-approve fallback** |
| Hosting (frontend) | Vercel / Netlify | Free tier, auto-deploy from Git |
| Hosting (backend + DB) | Render / Railway / Supabase | Free tier friendly |
| Maps | Leaflet + OpenStreetMap (free) or Google Maps embed | For "View map" per-outage affected streets |

---

## 3. Data Model

```
users
- id, name, email, password_hash, is_admin, created_at

subscribers
- id, email, barangay, sitio (nullable), verified (bool), created_at

outages
- id, title, municipality, barangay[], sitio_notes
- type (scheduled | emergency | brownout)
- status (scheduled | ongoing | restored | cancelled)
- date, start_time, end_time
- reason, source (manual | facebook), source_url
- map_geojson (nullable), created_by, created_at, updated_at

alert_logs
- id, outage_id, subscriber_id, sent_at, status (sent | failed)

fb_ingest_queue   (for the "combination" ingestion mode)
- id, raw_post_text, raw_post_url, parsed_outage_json,
  review_status (pending | approved | rejected), reviewed_by, created_at
```

---

## 4. Data Ingestion — "Combination" Mode

1. **Manual admin entry** — full form (title, municipality, barangays, date/time, type, status, reason) → publishes immediately.
2. **Facebook pull (semi-automated)**:
   - A scheduled job (cron, every 30–60 min) fetches CEBECO II's public Page posts via Graph API.
   - A simple parser flags posts matching outage keywords ("outage," "brownout," "PMS," barangay names) and extracts date/time/areas with regex + optional LLM-assisted parsing.
   - Parsed result lands in `fb_ingest_queue` as **pending** — never auto-published.
   - Admin reviews in dashboard → edits if needed → **Approve** (inserts into `outages`, source = "facebook") or **Reject**.
3. This keeps data accurate while saving manual retyping — the queue is the "combination" layer.

---

## 5. Public-Facing Features

- **Outage Schedule** — Day / Week / All Upcoming tabs, filterable by barangay/sitio
- **Search bar** — search by barangay or sitio name
- **Map view per outage** — Leaflet map highlighting affected streets/sitios (via `map_geojson`)
- **Outage detail card** — type badge, status badge, time range, reason, source link if from FB
- **Email alerts (real, not simulated)**:
  - Subscribe with email + barangay (+ optional sitio)
  - Email verification step (confirm link)
  - Triggered automatically when a new/updated outage matches subscriber's area
- **Contact page** — real CEBECO II hotline, FB page, office address (Bogo City) + this project's own contact
- **Municipality switcher** — dropdown for the 11 CEBECO II LGUs (Sogod pre-selected/default)
- **Transparency banner** — "unofficial project" disclaimer, same as VECO demo

---

## 6. Admin Features

- **Secure login** (real auth, not shared passcode) — role: admin
- **Dashboard** — total outages, upcoming count, subscriber count, alerts sent (real counts from DB)
- **Post/Edit/Cancel outage** — full CRUD form
- **FB Ingest Queue** — review/approve/reject parsed Facebook posts
- **Subscriber list** — view/export, unsubscribe management
- **Alert outbox / logs** — real send history with delivery status (not simulated)
- **Audit log** — who posted/edited/cancelled what, when

---

## 7. Core API Endpoints

```
GET    /api/outages?municipality=&barangay=&range=day|week|all
GET    /api/outages/:id
POST   /api/outages                 (admin)
PATCH  /api/outages/:id             (admin)
DELETE /api/outages/:id             (admin)

POST   /api/subscribers             (public subscribe)
GET    /api/subscribers/verify/:token
DELETE /api/subscribers/:id         (unsubscribe)

GET    /api/fb-queue                (admin)
POST   /api/fb-queue/:id/approve    (admin)
POST   /api/fb-queue/:id/reject     (admin)

POST   /api/auth/login
POST   /api/auth/logout
```

---

## 8. Notification Flow

1. Outage created/approved → matching query on `subscribers` (barangay ∈ outage.barangay[], verified = true)
2. Queue email job (BullMQ/Redis if scaling, or direct send for small volume)
3. Send via Resend/Mailgun → log to `alert_logs`
4. Retry once on failure, mark `failed` after 2 attempts

---

## 9. MVP Scope vs. Later Phases

**MVP (Sogod only):**
- Manual admin posting
- Public schedule + search + real email alerts
- Basic map (static barangay pins, not full street geo)

**Phase 2:**
- Facebook ingest queue (semi-automated)
- Full street-level `map_geojson`
- Expand to Danao City / Bogo City

**Phase 3:**
- Full 11-LGU CEBECO II coverage
- SMS alerts (Semaphore/Twilio) as email alternative
- Public API for other devs/apps

---

## 10. Suggested Folder Structure

```
/cebeco2-outage
  /frontend        (React + Vite + Tailwind)
  /backend
    /routes
    /jobs           (fb-ingest cron, email sender)
    /models
  /shared           (types, constants — barangay lists per LGU)
  README.md
```
