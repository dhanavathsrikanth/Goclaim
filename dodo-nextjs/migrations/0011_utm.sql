-- 0011_utm.sql — UTM attribution on clicks so buyers see where value came from
alter table clicks
  add column if not exists utm_source text not null default '',
  add column if not exists utm_medium text not null default '',
  add column if not exists utm_campaign text not null default '';

create index if not exists idx_clicks_listing_utm on clicks(listing_id, utm_source);
