-- Run this once in your Supabase project's SQL Editor (Supabase Dashboard ->
-- SQL Editor -> New query -> paste -> Run) before starting the backend.

create table if not exists content (
  key   text primary key,
  value jsonb not null
);

create table if not exists messages (
  id         text primary key,
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null,
  message    text not null,
  created_at timestamptz not null default now(),
  read       boolean not null default false
);

create table if not exists admin_users (
  id            bigint generated always as identity primary key,
  username      text unique not null,
  password_hash text not null
);

-- Row Level Security: keep it ON, but grant no policies to anon/authenticated
-- roles. The backend talks to Supabase using the service_role key, which
-- bypasses RLS entirely, so the browser (using only the public anon key,
-- which this app never even uses) can never read or write these tables
-- directly.
alter table content enable row level security;
alter table messages enable row level security;
alter table admin_users enable row level security;
