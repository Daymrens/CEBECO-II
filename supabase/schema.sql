-- =====================================================================
-- CEBECO II Outage Portal — Database Schema
-- Postgres-compatible SQL for Supabase (PostgreSQL 15+)
-- Run with: psql -d "$DATABASE_URL" -f supabase/schema.sql
--           or paste into the Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Users (admin accounts)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password_hash text not null,
  is_admin      boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Barangays (reference data: municipality -> barangay lookup)
-- ---------------------------------------------------------------------
create table if not exists public.barangays (
  municipality text not null,
  barangay     text not null,
  primary key (municipality, barangay)
);

-- ---------------------------------------------------------------------
-- Subscribers (email alert recipients)
-- ---------------------------------------------------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  barangay   text not null,
  sitio      text,
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscribers_email
  on public.subscribers (email);

create index if not exists idx_subscribers_barangay
  on public.subscribers (barangay);

-- ---------------------------------------------------------------------
-- Outages
-- Enum types are created idempotently inside DO blocks because vanilla
-- Postgres has no CREATE TYPE IF NOT EXISTS.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'outage_type') then
    create type public.outage_type as enum ('scheduled', 'emergency', 'brownout');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'outage_status') then
    create type public.outage_status as enum ('scheduled', 'ongoing', 'restored', 'cancelled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'outage_source') then
    create type public.outage_source as enum ('manual', 'facebook');
  end if;
end $$;

create table if not exists public.outages (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  municipality text not null,
  barangays   text[] not null,
  sitio_notes text,
  type        public.outage_type not null,
  status      public.outage_status not null default 'scheduled',
  date        date not null,
  start_time  time not null,
  end_time    time,
  reason      text,
  source      public.outage_source not null default 'manual',
  source_url  text,
  map_geojson jsonb,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_outages_status
  on public.outages (status);

create index if not exists idx_outages_date
  on public.outages (date);

create index if not exists idx_outages_type
  on public.outages (type);

create index if not exists idx_outages_municipality
  on public.outages (municipality);

-- ---------------------------------------------------------------------
-- Alert log (email delivery tracking)
-- ---------------------------------------------------------------------
create table if not exists public.alert_logs (
  id            uuid primary key default gen_random_uuid(),
  outage_id     uuid not null references public.outages (id) on delete cascade,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  sent_at       timestamptz not null default now(),
  status        text not null check (status in ('sent', 'failed'))
);

create index if not exists idx_alert_logs_outage
  on public.alert_logs (outage_id);

create index if not exists idx_alert_logs_subscriber
  on public.alert_logs (subscriber_id);

-- ---------------------------------------------------------------------
-- Trigger: keep updated_at fresh on outages
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_outages_set_updated_at on public.outages;
create trigger trg_outages_set_updated_at
  before update on public.outages
  for each row
  execute function public.set_updated_at();