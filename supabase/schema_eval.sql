-- VaultIQ — Evaluation, Guardrails & A/B Testing Schema
-- Run in Supabase SQL Editor after schema.sql

-- ─── Guardrail Violations ────────────────────────────────────────────────────
create table if not exists guardrail_violations (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  type       text,      -- 'pii_detected' | 'prompt_injection' | 'invalid_input' | 'invalid_output'
  route      text,
  detail     text,
  severity   text       -- 'low' | 'medium' | 'high' | 'critical'
);

-- ─── Evaluation Metrics (per AI request) ─────────────────────────────────────
create table if not exists evaluation_metrics (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz default now(),
  route           text,
  variant         text default 'control',   -- for A/B testing
  latency_ms      int,
  quality_score   numeric,    -- 0-100 composite
  completeness    numeric,    -- 0-1 (required fields present)
  coherence       numeric,    -- 0-1 (LLM self-assessed)
  relevance       numeric,    -- 0-1
  guardrail_passed boolean default true,
  output_length   int,
  input_tokens    int,
  output_tokens   int,
  model           text,
  user_id         uuid references auth.users(id),
  reference_id    uuid        -- links to fraud_analyses, credit_applications, etc.
);

-- ─── A/B Experiments ─────────────────────────────────────────────────────────
create table if not exists ab_experiments (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz default now(),
  name        text unique not null,   -- e.g. 'fraud_prompt_style'
  description text,
  route       text,
  status      text default 'active', -- 'active' | 'paused' | 'concluded'
  winner      text                    -- null until concluded
);

-- ─── A/B Variants ────────────────────────────────────────────────────────────
create table if not exists ab_variants (
  id            uuid primary key default uuid_generate_v4(),
  experiment_id uuid references ab_experiments(id),
  name          text,   -- 'control' | 'treatment_a' | 'treatment_b'
  description   text,
  weight        numeric default 0.5,  -- traffic split (0-1, must sum to 1 per experiment)
  prompt_key    text    -- key into prompts library
);

-- ─── A/B Results ─────────────────────────────────────────────────────────────
create table if not exists ab_results (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  experiment_id uuid references ab_experiments(id),
  variant_id    uuid references ab_variants(id),
  variant_name  text,
  latency_ms    int,
  quality_score numeric,
  user_id       uuid references auth.users(id)
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table guardrail_violations enable row level security;
alter table evaluation_metrics   enable row level security;
alter table ab_experiments       enable row level security;
alter table ab_variants          enable row level security;
alter table ab_results           enable row level security;

create policy "auth_select" on guardrail_violations for select using (auth.role() = 'authenticated');
create policy "auth_insert" on guardrail_violations for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on evaluation_metrics   for select using (auth.role() = 'authenticated');
create policy "auth_insert" on evaluation_metrics   for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on ab_experiments       for select using (auth.role() = 'authenticated');
create policy "auth_insert" on ab_experiments       for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on ab_variants          for select using (auth.role() = 'authenticated');
create policy "auth_insert" on ab_variants          for insert with check (auth.role() = 'authenticated');

create policy "auth_select" on ab_results           for select using (auth.role() = 'authenticated');
create policy "auth_insert" on ab_results           for insert with check (auth.role() = 'authenticated');

-- ─── Seed A/B Experiments ────────────────────────────────────────────────────
insert into ab_experiments (name, description, route, status) values
  ('fraud_prompt_style',      'Zero-shot vs few-shot for fraud detection',          '/api/fraud/analyze',      'active'),
  ('credit_prompt_style',     'Standard vs chain-of-thought for credit decisions',  '/api/credit/evaluate',    'active'),
  ('compliance_prompt_style', 'Base vs regulatory-expert persona for compliance',   '/api/compliance/query',   'active');
