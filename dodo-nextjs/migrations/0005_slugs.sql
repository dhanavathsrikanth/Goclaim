alter table listings add column if not exists slug text not null default '';

-- Partial unique index: enforces slug uniqueness while tolerating
-- legacy rows that were never slugified (slug = '').
create unique index if not exists idx_listings_slug on listings(slug) where slug <> '';
