# TODO

CEBECO II Outage Portal MVP — 5 phases (Scaffold+DB, Admin, Public Pages, Email Alerts, Map).
Contract: armada/REQUIREMENTS.md (Status: APPROVED).

- [ ] CEBECO II Outage Portal — MVP (scaffold, admin, public pages, email alerts, map)

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

- [ ] Phase 3 — Public pages (outage list/calendar, subscribe form)
- [ ] Phase 4 — Email alerts (Resend) + alert_logs wiring
- [ ] Phase 5 — Map (map_geojson + Leaflet/MapLibre)
- [ ] Move to Postgres store in a real environment and re-run smoke tests there