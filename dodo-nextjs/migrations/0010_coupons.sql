-- 0010_coupons.sql — free-listing coupon codes (early launch)
-- One code (e.g. EARLY100) subsidizes a $2 starter rank. No invite chain.
create table if not exists coupons (
  code text primary key,
  max_uses integer not null default 100,
  uses integer not null default 0,
  amount integer not null default 2,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table payments
  add column if not exists coupon_code text not null default '';

create index if not exists idx_payments_coupon on payments(coupon_code);
create index if not exists idx_coupons_active on coupons(active);

-- Seed the launch code: 100 free $2 listings, 30-day window. Idempotent.
insert into coupons (code, max_uses, uses, amount, active, expires_at)
values ('EARLY100', 100, 0, 2, true, now() + interval '30 days')
on conflict (code) do nothing;
