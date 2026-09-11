-- 0012_free_flag.sql — distinguish FREE-claimed listings from paid ones
-- Free listings show a FREE badge while only paid listings show a $ amount
alter table listings
  add column if not exists claimed_free boolean not null default false;

create index if not exists idx_listings_claimed_free on listings(claimed_free);

-- Backfill: listings whose rank came only from coupon/founding grants.
update listings set claimed_free = true
where id in (
  select listing_id from payments where coupon_code <> '' and status = 'confirmed'
)
and total_bid <= 2
and status = 'confirmed';
