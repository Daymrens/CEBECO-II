-- =====================================================================
-- CEBECO II Outage Portal — Seed data
-- Idempotent: safe to run multiple times (ON CONFLICT DO NOTHING).
-- =====================================================================

-- Reference list of all Sogod, Cebu barangays (18).
-- The barangays table is a shared lookup used by outages.subscribers,
-- outage forms, and the public filter/browse UI.
insert into public.barangays (municipality, barangay)
values
  ('Sogod', 'Ampongol'),
  ('Sogod', 'Bagakay'),
  ('Sogod', 'Bagatayam'),
  ('Sogod', 'Bawo'),
  ('Sogod', 'Cabalawan'),
  ('Sogod', 'Cabangahan'),
  ('Sogod', 'Calumboyan'),
  ('Sogod', 'Dakit'),
  ('Sogod', 'Damolog'),
  ('Sogod', 'Ibabao'),
  ('Sogod', 'Liki'),
  ('Sogod', 'Lubo'),
  ('Sogod', 'Mohon'),
  ('Sogod', 'Nahus-an'),
  ('Sogod', 'Pansoy'),
  ('Sogod', 'Poblacion'),
  ('Sogod', 'Tabunok'),
  ('Sogod', 'Takay')
on conflict (municipality, barangay) do nothing;