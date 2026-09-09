# Phase 5 Complete (Core Loop) — Sponsor Ad System

**Date:** 2026-09-08
**Status:** Core loop done (5.0–5.5 + 5.10), tested end-to-end. Upload/email/admin deferred (5.6–5.9).

## What shipped

Whoever is **#1 at the daily UTC cutoff** gets the homepage ad slot + top-3 logo wall + a live "valid until" countdown — wired UI → API → Neon DB. The daily trigger is an **Upstash QStash cron** hitting a signature-verified endpoint.

## Actions taken

### 1. Migration — `sponsor_snapshots` (5.0)
- `dodo-nextjs/migrations/0003_snapshots.sql` (applied via `node migrate.cjs`):
  - `sponsor_snapshots(snapshot_date date, rank int, listing_id → listings(id) cascade, total_bid, product_name, favicon_url, created_at)`
  - `PRIMARY KEY (snapshot_date, rank)` — the idempotency guarantee behind QStash retries.
  - Index on `snapshot_date desc`.
- Product name/favicon denormalized so the slot renders even if the listing row changes.

### 2. Deps + data layer
- Installed `@upstash/qstash@2.11.3`. QStash env vars (`QSTASH_URL`, `QSTASH_TOKEN`, signing keys) already in `dodo-nextjs/.env.local` (gitignored).
- `src/lib/types.ts`: new `SponsorEntry` type.
- `src/lib/data.ts`:
  - `snapshotSponsors()` — ranks confirmed listings by `total_bid desc`, inserts top 3 for today's UTC date with `on conflict do nothing`; returns `{ snapshot_date, rows }`.
  - `getActiveSponsor()` — latest snapshot date's entries joined to `listings` for live URLs; `null` when no snapshot exists.

### 3. Cron route + sponsor API (5.1, 5.2)
- `src/app/api/cron/sponsor-snapshot/route.ts` (GET + POST):
  - Production path requires a valid `Upstash-Signature` (verified with `Receiver` + current/next signing keys). Missing → 401, invalid → 401, unconfigured keys → 500.
  - Dev path: `?dev=1` bypasses verification only when `NODE_ENV !== "production"` (QStash can't reach localhost).
- `src/app/api/sponsor/route.ts` — `GET /api/sponsor` → `{ snapshot_date, sponsor (rank 1), top3, valid_until (next UTC midnight ISO) }`, or `{ sponsor: null, ... }` on empty.

### 4. Homepage UI (5.3, 5.4, 5.5, 5.10)
- `src/app/components/SponsorBanner.tsx` (new) — hero ad slot: "👑 Current sponsor" badge, large favicon (letter fallback = 5.5), name, winning bid, amber Visit button (`rel="sponsored"`), live per-second countdown "Ad valid until 00:00 UTC · HH:MM:SS left" (= 5.10).
- `src/app/components/LogoWall.tsx` (new) — "Sponsored by" top-3 pill strip (= 5.4), each linking via `/api/go` (click-tracked).
- `src/app/page.tsx` — polls `/api/sponsor` on mount + every 60s; banner renders in hero above `BidForm`, wall below hero. No snapshot → slot hidden (correct empty state).

## Verification

- `npm run build` — passes.
- Seeded 4 confirmed listings ($200/$120/$90/$30).
  - `GET /api/cron/sponsor-snapshot?dev=1` → `{ ok, snapshot_date: 2026-09-08, rows: 3 }`; DB holds ranks 1–3 ($200/$120/$90; $30 correctly excluded).
  - Re-trigger → still 3 rows (**idempotent**).
  - `GET /api/sponsor` → rank-1 sponsor + top3 + `valid_until: <next midnight UTC>`.
  - POST/GET with no signature → **401**; POST with bogus signature → **401**.
  - Homepage → **200**.
  - Empty board: snapshot → 0 rows, `/api/sponsor` → `{ sponsor: null }` (graceful).
- All test data cleaned (DB empty); temp scripts deleted; dev server stopped.

## Files changed

- `dodo-nextjs/migrations/0003_snapshots.sql` (new)
- `dodo-nextjs/package.json` (+ `@upstash/qstash`)
- `dodo-nextjs/src/lib/types.ts` (`SponsorEntry`)
- `dodo-nextjs/src/lib/data.ts` (`snapshotSponsors`, `getActiveSponsor`)
- `dodo-nextjs/src/app/api/cron/sponsor-snapshot/route.ts` (new)
- `dodo-nextjs/src/app/api/sponsor/route.ts` (new)
- `dodo-nextjs/src/app/components/SponsorBanner.tsx` (new)
- `dodo-nextjs/src/app/components/LogoWall.tsx` (new)
- `dodo-nextjs/src/app/page.tsx` (sponsor poll + slot rendering)

## Deferred (5.6–5.9) + what's needed

- **5.6 Creative upload UI** — fold into Phase 6 dashboard (store banner/logo as URL strings on the listing or snapshot row).
- **5.7 R2 storage** — needs Cloudflare R2 bucket + API tokens. Until then: URL-only creatives.
- **5.8 Winner email** — needs Resend/Lettermail API key.
- **5.9 Review queue** — Phase 11 admin hook.

## Post-deploy step (QStash schedule — do after deploy, QStash can't reach localhost)

```bash
curl -X POST "https://qstash-us-east-1.upstash.io/v2/schedules/https://<YOUR-DOMAIN>/api/cron/sponsor-snapshot" \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Upstash-Cron: 0 0 * * *" \
  -H "Upstash-Schedule-Id: sponsor-snapshot-daily" \
  -d '{}'
```

Verify in the Upstash console that the schedule fires at 00:00 UTC and the route returns `{ ok: true }`.

## Notes / debts

- Dev server bound **port 3000** this session (3001's usual occupant was gone) — always check the `Local:` line in dev output instead of assuming 3001.
- First `node seed5.cjs seed` died silently (Windows `UV_HANDLE_CLOSING` assertion noise); re-run showed "seeded". Treat missing success output as failure and retry.
- Snapshot ties broken by earliest `created_at` — deterministic, documented.

## Next

Phase 6 — Buyer dashboard (位次 chart from `clicks_by_day`, creative URL form feeding 5.6, per-listing stats). Blocked by nothing.