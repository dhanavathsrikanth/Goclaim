# Phase 6 Complete — Buyer Dashboard

**Date:** 2026-09-08
**Status:** Done — all 8 tasks shipped, tested end-to-end, no blockers.

## What shipped

Post-purchase experience with a lightweight **claim identity** (no passwords): pay → success page polls for confirmation → bookmarkable dashboard link shows rank, clicks, ad status, payments, raise-bid, and creative URLs.

## Actions taken

### 1. Claim identity (6.8)
- `migrations/0004_claims.sql` (applied): `listings.claim_email`, `banner_url`, `logo_url` + index on `claim_email`.
- `src/lib/claim.ts` (new): deterministic HMAC-SHA256 tokens — `createClaimToken(email)` / `verifyClaimToken(token)` (timing-safe). Token format `<b64url(email)>.<hex>`. `CLAIM_SECRET` added to `dodo-nextjs/.env.local` (gitignored).
- `src/lib/types.ts` + `data.ts`: new columns through `rowToListing`/`upsertListing`; new queries `getListingsByEmail`, `getPaymentById`, `getPaymentsByListingId`.
- Webhook (`api/webhook`): on payment success, sets `listing.claim_email` from `customer_email` (first-write-wins, lowercased).
- Checkout (`api/checkout`): `return_url` now points at `/payment/success?listing=<id>&pay=<paymentId>` (unguessable pay id = proof of ownership).
- `GET /api/payment/claim?listing=&pay=`: 404 unknown pair → 202 while payment/email pending → `{ claim_token }` when confirmed. This is what makes guest checkout resolvable without login.
- `src/app/payment/success/page.tsx` (new): polls the claim endpoint (3s × 40), then shows the dashboard link; invalid links get an error state.

### 2. Dashboard (6.1–6.6)
- `GET /api/dashboard?claim=`: 401 on bad token; returns per-listing `{ listing, ranks {all-time,today,daily}, clicks_by_day, payments, ad_live, ad_valid_until }`. Ranks reuse `getBoardListings`; ad status from `getActiveSponsor`.
- `src/app/dashboard/page.tsx` (new):
  - 6.1 listing list + 6.2 per-board ranks (6.3) click totals + 14-day CSS bar chart from `clicks_by_day` (6.4) "👑 LIVE until 00:00 UTC" vs "win #1 before midnight" (6.5) "Raise bid" → `/?raise=<id>` (6.6) payment history per listing.
- `/?raise=<id>` prefills `BidForm` (url + `total_bid + 1`) via remount key; `BidForm` accepts `initialUrl`/`initialAmount`.

### 3. Creative URLs (6.7, feeds 5.6)
- `PUT /api/listing/[id]` (owner-only): `{ claim, banner_url?, logo_url? }` → 401/403/404 enforced, URLs validated (`https?://`, ≤500 chars, invalid → `""`).
- Dashboard `CreativeForm` per listing saves through it. (R2 upload in 5.7 still pending; URL-first as planned.)

## Verification

- `npm run build` — passes (`/dashboard`, `/payment/success` live).
- Seed: buyer@x.com × 2 listings + payments + clicks, stranger listing, pending pair.
  - Claim before webhook → **202 pending**; simulated webhook (`customer_email: newbuyer@x.com`) → listing confirmed, total updated, `claim_email` set.
  - Claim after → token issued; wrong pay id → **404**; bad dashboard token → **401**.
  - newbuyer dashboard: exactly 1 listing, ranks `{all-time:#3, today:#2, daily:#2}` (correct behind $500/$150), 1 payment, `ad_live: false`.
  - buyer dashboard: exactly 2 listings (**isolation holds**), 2 payments on d1, day buckets `[{09-07:2},{09-08:1}]`.
  - PUT owner: banner saved, bad logo URL → `""`; PUT stranger token → **403**.
  - `/dashboard`, `/payment/success`, `/?raise=` all **200**.
- All test data cleaned (DB empty); temp scripts deleted; dev server stopped.

## Files changed

- `dodo-nextjs/migrations/0004_claims.sql` (new)
- `dodo-nextjs/src/lib/claim.ts` (new)
- `dodo-nextjs/src/lib/types.ts`, `src/lib/data.ts`
- `dodo-nextjs/src/app/api/checkout/route.ts` (return_url)
- `dodo-nextjs/src/app/api/webhook/route.ts` (claim_email)
- `dodo-nextjs/src/app/api/payment/claim/route.ts` (new)
- `dodo-nextjs/src/app/api/dashboard/route.ts` (new)
- `dodo-nextjs/src/app/api/listing/[id]/route.ts` (PUT creatives)
- `dodo-nextjs/src/app/payment/success/page.tsx` (new)
- `dodo-nextjs/src/app/dashboard/page.tsx` (new)
- `dodo-nextjs/src/app/components/BidForm.tsx` (prefill props)
- `dodo-nextjs/src/app/page.tsx` (`?raise=` handling)

## Notes / debts

- Claim tokens never expire and are bearer tokens in the URL — anyone with the link sees the dashboard. Matches the plan's "lightweight" intent; add expiry/rotation only if abuse appears.
- Dashboard does N+1 queries per listing (3 boards + clicks + payments). Fine at buyer scale; add caching if it ever hurts.
- Seed scripts keep dying silently under `2> $null` chaining on this machine (Windows assertion teardown) — run visibly and require the success line.
- Dev port varies (3000 vs 3001) — check the `Local:` line.

## Next

Phase 7 — Listing pages (7.2 OG/meta, 7.4 related listings, 7.5 slug URLs; 7.1/7.3 already done).