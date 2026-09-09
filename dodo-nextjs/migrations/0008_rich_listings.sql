-- 0008_rich_listings.sql
alter table listings
  add column if not exists promo_code text not null default '',
  add column if not exists promo_offer text not null default '',
  add column if not exists demo_url text not null default '',
  add column if not exists founder_note text not null default '';
