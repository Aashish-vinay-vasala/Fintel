-- VaultIQ AI Banking Platform — Supabase Schema
-- Run this in the Supabase SQL Editor at: https://supabase.com/dashboard/project/<your-project>/sql

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Fraud Analyses ──────────────────────────────────────────────────────────
create table if not exists fraud_analyses (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  user_id       uuid references auth.users(id),
  -- inputs
  amount        numeric,
  hour_of_day   int,
  tx_last_24h   int,
  avg_amount_7d numeric,
  distance_km   numeric,
  is_foreign    boolean,
  is_same_city  boolean,
  -- outputs
  fraud_score   numeric,
  is_fraud      boolean,
  recommendation text,
  explanation   text,
  full_result   jsonb
);

-- ─── Credit Applications ─────────────────────────────────────────────────────
create table if not exists credit_applications (
  id               uuid primary key default uuid_generate_v4(),
  created_at       timestamptz default now(),
  user_id          uuid references auth.users(id),
  -- inputs
  age              int,
  annual_income    numeric,
  loan_amount      numeric,
  credit_score     int,
  employment_years int,
  existing_loans   int,
  missed_payments  int,
  debt_to_income   numeric,
  -- outputs
  decision         text,
  approval_score   numeric,
  suggested_limit  numeric,
  explanation      text,
  full_result      jsonb
);

-- ─── Risk Analyses ────────────────────────────────────────────────────────────
create table if not exists risk_analyses (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  user_id         uuid references auth.users(id),
  -- inputs
  total_assets    numeric,
  loan_portfolio  numeric,
  npa_amount      numeric,
  tier1_capital   numeric,
  -- outputs
  overall_risk    text,
  risk_score      numeric,
  tier1_ratio     numeric,
  summary         text,
  full_result     jsonb
);

-- ─── AML Records ──────────────────────────────────────────────────────────────
create table if not exists aml_records (
  id             uuid primary key default uuid_generate_v4(),
  created_at     timestamptz default now(),
  user_id        uuid references auth.users(id),
  type           text,        -- 'narrative' or 'screening'
  input_data     jsonb,
  risk_level     text,
  risk_score     int,
  recommendation text,
  full_result    jsonb
);

-- ─── Compliance Queries ───────────────────────────────────────────────────────
create table if not exists compliance_queries (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now(),
  user_id     uuid references auth.users(id),
  query_type  text,        -- 'general', 'transaction', 'regulatory'
  question    text,
  answer      text
);

-- ─── Loan Monitoring ──────────────────────────────────────────────────────────
create table if not exists loan_monitoring (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz default now(),
  user_id      uuid references auth.users(id),
  portfolio    jsonb,
  loans        jsonb,
  health_score int,
  rating       text,
  ewi_count    int,
  summary      text,
  full_result  jsonb
);

-- ─── Reports ──────────────────────────────────────────────────────────────────
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now(),
  user_id     uuid references auth.users(id),
  report_type text,
  label       text,
  content     text,
  context     jsonb
);

-- ─── Alerts (Dashboard live feed) ────────────────────────────────────────────
create table if not exists alerts (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz default now(),
  level        text,   -- 'critical', 'warning', 'info'
  title        text,
  description  text,
  source       text,   -- 'fraud', 'aml', 'compliance', 'system'
  reference_id uuid
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table fraud_analyses    enable row level security;
alter table credit_applications enable row level security;
alter table risk_analyses     enable row level security;
alter table aml_records       enable row level security;
alter table compliance_queries enable row level security;
alter table loan_monitoring   enable row level security;
alter table reports           enable row level security;
alter table alerts            enable row level security;

-- All authenticated bank staff can read and insert
create policy "auth_select" on fraud_analyses    for select using (auth.role() = 'authenticated');
create policy "auth_insert" on fraud_analyses    for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on credit_applications for select using (auth.role() = 'authenticated');
create policy "auth_insert" on credit_applications for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on risk_analyses     for select using (auth.role() = 'authenticated');
create policy "auth_insert" on risk_analyses     for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on aml_records       for select using (auth.role() = 'authenticated');
create policy "auth_insert" on aml_records       for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on compliance_queries for select using (auth.role() = 'authenticated');
create policy "auth_insert" on compliance_queries for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on loan_monitoring   for select using (auth.role() = 'authenticated');
create policy "auth_insert" on loan_monitoring   for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on reports           for select using (auth.role() = 'authenticated');
create policy "auth_insert" on reports           for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on alerts            for select using (auth.role() = 'authenticated');
create policy "auth_insert" on alerts            for insert with check (auth.role() = 'authenticated');

-- ─── Seed: initial system alerts ─────────────────────────────────────────────
insert into alerts (level, title, description, source) values
  ('info',     'VaultIQ connected to Supabase',           'Real-time database active — all analyses will be persisted', 'system'),
  ('info',     'Sanctions list updated',                  'OFAC SDN list refreshed · 12 new entries screened against portfolio', 'system');
