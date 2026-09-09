-- 0009_click_sources.sql
alter table clicks add column if not exists source text not null default 'all-time';
create index if not exists idx_clicks_listing_source on clicks(listing_id, source);
