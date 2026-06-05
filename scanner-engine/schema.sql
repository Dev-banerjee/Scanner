-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================
-- Scans Table
-- =========================
create table scans (
  id uuid default uuid_generate_v4() primary key,
  target_url text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  crawled_count integer default 0,
  vulnerability_count integer default 0,
  user_id uuid
);

-- =========================
-- Vulnerabilities Table
-- =========================
create table vulnerabilities (
  id uuid default uuid_generate_v4() primary key,
  scan_id uuid references scans(id) on delete cascade,
  
  name text not null,
  severity text not null,
  
  url text not null,
  param text,
  payload text,
  
  evidence text,
  
  cwe text,
  
  description text,
  remediation text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================
-- Enable Row Level Security
-- =========================
alter table scans enable row level security;
alter table vulnerabilities enable row level security;

-- =========================
-- Policies (Open for Demo)
-- =========================
create policy "Enable read/insert for all"
on scans
for all
using (true)
with check (true);

create policy "Enable read/insert for all"
on vulnerabilities
for all
using (true)
with check (true);