alter table listings add column if not exists claim_email text not null default '';
alter table listings add column if not exists banner_url text not null default '';
alter table listings add column if not exists logo_url text not null default '';

create index if not exists idx_listings_claim_email on listings(claim_email);
