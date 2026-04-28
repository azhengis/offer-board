alter table offers
  add column verified boolean not null default false;

create index on offers (verified);
