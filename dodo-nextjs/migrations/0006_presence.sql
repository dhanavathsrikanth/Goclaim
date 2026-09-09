create table if not exists presence (
  client_id text primary key,
  path text not null default '',
  last_seen timestamptz not null default now()
);

create index if not exists idx_presence_seen on presence(last_seen);
