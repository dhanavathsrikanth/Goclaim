-- 0013_coupon_first20.sql — launch code is FIRST20 with 20 uses
-- Retires EARLY100 so only the new code works going forward
insert into coupons (code, max_uses, uses, amount, active, expires_at)
values ('FIRST20', 20, 0, 2, true, now() + interval '30 days')
on conflict (code) do nothing;

update coupons set active = false where code = 'EARLY100';
