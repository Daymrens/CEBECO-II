# TODO

CEBECO II Outage Portal MVP — 5 phases (Scaffold+DB, Admin, Public Pages, Email Alerts, Map).
Contract: armada/REQUIREMENTS.md (Status: APPROVED).

- [x] CEBECO II Outage Portal — MVP (scaffold, admin, public pages, email alerts, map) (master @ Daymrens/CEBECO-II) (2026-09-02)

## Phase 2 — Admin Auth + Dashboard (DONE)

- [x] Real auth: bcrypt hashing (bcryptjs) + signed JWT sessions (jose, httpOnly cookie)
- [x] `audit_logs` table in supabase/schema.sql (idempotent)
- [x] Data-access layer (src/lib/db): DBAdapter interface, JSON-file store (default), Postgres store
- [x] Admin seed script (scripts/seed-admin.ts): admin@cebeco.example / admin1234
- [x] API: login/logout/me/stats/audit-logs + outages CRUD; all admin routes guarded
- [x] Admin UI: /admin/login, /admin dashboard, /admin/outages (+new/edit/cancel), /admin/audit-logs
- [x] Every admin mutation writes an audit_logs row
- [x] Verification: build, auth flow, CRUD+audit, dashboard 200 (see git log)

## NEXT

- [x] Phase 3 — Public pages (outage list/calendar, subscribe form)
- [x] Phase 4 — Email alerts (Resend) + alert_logs wiring
- [x] Phase 5 — Map (map_geojson + Leaflet/MapLibre)
- [ ] Move to Postgres store in a real environment and re-run smoke tests there
- [ ] Set real RESEND_API_KEY + verified EMAIL_FROM domain for live email delivery
- [ ] Verify full Sogod barangay coordinate table for the map (most are placeholders)