create table if not exists sponsor_snapshots (
  snapshot_date date not null,
  rank integer not null,
  listing_id text not null references listings(id) on delete cascade,
  total_bid integer not null default 0,
  product_name text not null default '',
  favicon_url text not null default '',
  created_at timestamptz not null default now(),
  primary key (snapshot_date, rank)
);

create index if not exists idx_snapshots_date on sponsor_snapshots(snapshot_date desc);
