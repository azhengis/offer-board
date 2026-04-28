create table email_verifications (
  id          uuid primary key default gen_random_uuid(),
  email_hash  text not null,   -- sha256 of the address; never the address itself
  code_hash   text not null,   -- sha256 of the 6-digit OTP
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '15 minutes'
);

-- prevent the same address from having two pending (unverified) codes at once;
-- allows a second attempt once the first is verified or expired
create unique index email_verifications_pending_unique
  on email_verifications (email_hash)
  where (verified = false);

-- no public RLS policies; all access goes through service-role API routes
alter table email_verifications enable row level security;
