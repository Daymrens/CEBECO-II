# Contract: CEBECO II Outage Portal — MVP

Status: APPROVED
Commodore: armada
Stack: Next.js + TypeScript + Tailwind CSS + PostgreSQL (Supabase)

## Goal

Build an MVP power-outage tracking and alert portal for Sogod, Cebu (CEBECO II franchise area). Public users browse scheduled/ongoing outages and subscribe to email alerts. Admins post outages via a secure dashboard. All data is real (no simulation). MVP scope: Sogod only, manual admin posting, public schedule, email alerts, basic map.

## Phases (dependency-ordered)

### Phase 1 — Scaffold + DB Schema (no deps)
- [ ] Next.js + TypeScript project setup with Tailwind CSS
- [ ] Supabase client configured (PostgreSQL connection)
- [ ] Database schema: `users`, `subscribers`, `outages`, `alert_logs`
- [ ] Seed data for Sogod barangays + sitios (from shared constants)
- [ ] Environment variables documented (.env.example)

**Success criteria:**
- `npm run dev` starts without errors
- Schema migrated to Supabase (tables exist, seed data loaded)
- Sogod barangay list accessible via shared constant

### Phase 2 — Admin Auth + Dashboard (depends on Phase 1)
- [ ] Admin auth: Supabase Auth or JWT + bcrypt (real auth, not shared passcode)
- [ ] Admin login page with secure session handling
- [ ] Admin dashboard: total outages, upcoming count, subscriber count (real DB counts)
- [ ] Outage CRUD: create, edit, cancel (status → cancelled) with full form (title, barangay[], type, status, date/time, reason)
- [ ] Audit log: who posted/edited/cancelled what, when
- [ ] Protected API routes (admin-only middleware)

**Success criteria:**
- Admin can log in with credentials
- Create/edit/cancel an outage via dashboard UI
- Dashboard shows real counts from database
- Audit log records all admin actions

### Phase 3 — Public Pages (depends on Phase 1)
- [ ] Outage schedule page: Day / Week / All Upcoming tabs
- [ ] Filter by barangay/sitio
- [ ] Search bar: search by barangay or sitio name
- [ ] Outage detail card: type badge, status badge, time range, reason
- [ ] Municipality switcher dropdown (11 CEBECO II LGUs, Sogod default)
- [ ] Contact page: CEBECO II hotline, FB page, office address (Bogo City) + project contact
- [ ] Transparency banner ("unofficial project" disclaimer)

**Success criteria:**
- Public user can browse outages by tab (day/week/all)
- Filter and search return correct results
- Municipality switcher changes displayed outages
- Contact page shows real CEBECO II info

### Phase 4 — Email Alerts (depends on Phase 1, 2)
- [ ] Subscribe flow: email + barangay (+ optional sitio)
- [ ] Email verification step (confirm link sends real email)
- [ ] Notification trigger: new/updated outage matches subscriber area → queue email
- [ ] Email delivery via Resend (real, not simulated)
- [ ] Alert log: sent_at, status (sent/failed), retry once on failure

**Success criteria:**
- User subscribes, receives verification email, confirms
- Admin creates outage → matching subscribers receive alert email
- Alert log shows delivery status in admin dashboard

### Phase 5 — Basic Map (depends on Phase 1)
- [ ] Leaflet + OpenStreetMap integration
- [ ] Static barangay pins for Sogod on outage detail pages
- [ ] Basic map view per outage (centered on affected barangay)

**Success criteria:**
- Outage detail page shows a Leaflet map with barangay pin
- Map renders correctly in browser (no console errors)

## Final success criteria
1. `npm run dev` starts the full app without errors
2. Admin can log in, create/edit/cancel outages, see dashboard stats
3. Public user can browse outages (tabs, filter, search), view detail cards with map
4. Subscribe flow works end-to-end: subscribe → verify → receive real email alert
5. Municipality switcher works (Sogod default, other LGUs structural)
6. Contact page and transparency banner present
7. All data is real (no simulated/mock data)
