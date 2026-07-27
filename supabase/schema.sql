-- Run in Supabase SQL editor, or this app can create via scripts/seed.ts if you use service role.
create table if not exists qcf_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists qcf_picks (
  user_id uuid primary key references qcf_users(id) on delete cascade,
  order_ids jsonb not null,
  submitted_at timestamptz not null default now()
);

create table if not exists qcf_eliminations (
  contestant_id text primary key,
  position int unique not null check (position > 0),
  eliminated_at timestamptz not null default now()
);

create table if not exists qcf_contestants (
  id text primary key,
  name text not null,
  handle text not null,
  photo_url text not null,
  bio text not null,
  color text not null
);
