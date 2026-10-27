-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query → Run).

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 100),
  attending   boolean not null,
  party_size  integer not null default 1 check (party_size between 0 and 10),
  phone       text check (phone is null or char_length(phone) <= 40),
  message     text check (message is null or char_length(message) <= 500),
  locale      text not null default 'en' check (locale in ('en', 'ar')),
  edit_token  uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

-- Row Level Security on with NO policies: the public (anon) API key can't read
-- or write anything. Only the website's server, using the service_role key,
-- can reach this table.
alter table public.rsvps enable row level security;
