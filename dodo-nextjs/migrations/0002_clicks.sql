create table if not exists clicks (
  id bigserial primary key,
  listing_id text not null references listings(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create index if not exists idx_clicks_listing on clicks(listing_id);
create index if not exists idx_clicks_listing_day on clicks(listing_id, clicked_at);
