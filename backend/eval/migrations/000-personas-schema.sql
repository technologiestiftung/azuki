-- backend/eval/migrations/000-personas-schema.sql
-- Run once in the Supabase SQL editor (or via psql).

create table personas (
  id          text primary key,
  name        text not null,
  description text,
  profile     jsonb not null,
  tier_s      integer[] not null default '{}',
  tier_a      integer[] not null default '{}',
  tier_c      integer[] not null default '{}',
  criteria    jsonb not null default '[]',
  in_eval_set boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index personas_in_eval_set_idx
  on personas (in_eval_set)
  where in_eval_set;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger personas_set_updated_at
  before update on personas
  for each row execute function set_updated_at();
