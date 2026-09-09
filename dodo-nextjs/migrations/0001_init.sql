create table if not exists listings (
  id text primary key,
  url text not null,
  normalized_url text not null unique,
  product_name text not null default '',
  description text not null default '',
  favicon_url text not null default '',
  category text not null default 'Other',
  total_bid integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending'
);

create table if not exists payments (
  id text primary key,
  listing_id text not null references listings(id),
  checkout_session_id text not null default '',
  amount integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_listings_status on listings(status);
create index if not exists idx_payments_listing on payments(listing_id);
create index if not exists idx_payments_session on payments(checkout_session_id);