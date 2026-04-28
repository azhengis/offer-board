create type offer_type as enum ('full_time', 'internship', 'co_op');

create table offers (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),

  -- role
  company           text not null,
  role              text not null,
  offer_type        offer_type not null,
  location          text not null,

  -- compensation
  base_salary       int not null check (base_salary >= 0),
  equity_per_year   int not null default 0 check (equity_per_year >= 0),
  total_comp        int not null generated always as (
                      base_salary + equity_per_year
                    ) stored,

  -- background
  school            text not null,

  -- other
  notes             text
);

-- no auth: allow anyone to read and insert, nobody can update or delete
alter table offers enable row level security;

create policy "public select"
  on offers for select
  using (true);

create policy "public insert"
  on offers for insert
  to anon
  with check (true);

-- indexes for the common sort columns
create index on offers (total_comp desc);
create index on offers (base_salary desc);
create index on offers (created_at desc);
create index on offers (offer_type);
create index on offers (company);
