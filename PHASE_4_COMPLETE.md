# Phase 4 Complete — Click Tracking

**Date:** 2026-09-08
**Status:** Done — shipped, tested end-to-end, no blockers.

## What Phase 4 delivered

Every `/api/go` hit is now **persisted as a row** in a new Neon `clicks` table, and per-day click counts are **queryable** — the exit criteria (every click tracked + countable per day) is met. This unblocks the Phase 6 buyer dashboard per-day chart.

Prior phases had already shipped 4.1 (redirect endpoint), 4.2 (query-param stripping), 4.3 (`rel="sponsored"` — done early in Phase 3), and 4.4 (click count display). This phase closed the one gap: **4.5 click analytics**.

## Actions taken

### 1. Migration — `clicks` table (task 4.5)
- `dodo-nextjs/migrations/0002_clicks.sql` (new, applied via `node migrate.cjs` with the direct URL):
  - `clicks(id bigserial pk, listing_id text → listings(id) on delete cascade, clicked_at timestamptz default now())`
  - Indexes on `(listing_id)` and `(listing_id, clicked_at)` for the per-day query.
- Verified on Neon: tables are now `clicks, listings, payments`.

### 2. Data layer — `recordClick` + `getClicksByDay`
- `src/lib/data.ts`:
  - `recordClick(listingId)` — bumps `listings.click_count` (+ refreshes `updated_at`) **and** inserts a `clicks` row. Counter stays as the cheap cache; rows are the source of truth.
  - `getClicksByDay(listingId, days = 30)` — groups `clicks` by UTC day (`YYYY-MM-DD`) from the start of day `days-1` days ago; returns `[{ day, clicks }]`.

### 3. Route changes
- `src/app/api/go/[id]/route.ts` — each hit now calls `recordClick(id)` instead of mutating the whole listing and full-row-upserting it (cheaper, and no risk of clobbering other fields on concurrent clicks).
- `src/app/api/listing/[id]/route.ts` — `GET` response now includes `clicks_by_day` (last 30 days, additive field). Phase 6 can render its chart straight from this endpoint. Also removed a dead `getListings` import.

## Verification

- `npm run build` — passes.
- Seeded 1 confirmed listing + 1 backdated click row (yesterday).
- Hit `/api/go/lst_click` 5× (302s).
  - `clicks` table: **6 rows** (1 backdated + 5 live) ✓
  - `listings.click_count` = **5** ✓ (backdated direct-SQL insert correctly excluded — counter tracks live `/api/go` hits only)
  - `GET /api/listing/lst_click` → `clicks_by_day: [{2026-09-07: 1}, {2026-09-08: 5}]` ✓ — per-day bucketing works through HTTP.
  - Raw-SQL grouping matched the API output exactly ✓
- All test data cleaned up (clicks + payments + listing rows); DB left empty; temp scripts deleted; dev server stopped; port 3001 free.

## Files changed

- `dodo-nextjs/migrations/0002_clicks.sql` (new)
- `dodo-nextjs/src/lib/data.ts` (`recordClick`, `getClicksByDay`)
- `dodo-nextjs/src/app/api/go/[id]/route.ts`
- `dodo-nextjs/src/app/api/listing/[id]/route.ts` (`clicks_by_day` in GET)

## Notes / debts

- `click_count` (counter) and `clicks` (rows) can drift if a row insert fails after the counter bump (no transaction wraps the two writes). Acceptable for now — rows are the source of truth for analytics; counter is display cache.
- Day bucketing is UTC (`date_trunc('day', clicked_at)`). Matches the UTC daily-cutoff model; revisit only if per-timezone analytics are ever needed.

## Next

Phase 5 — Sponsor Ad System 🏆 (daily 00:00 UTC snapshot cron, homepage ad slot, logo wall, winner email). Needs `migrations/0003_snapshots.sql` and a cron trigger (Neon scheduled jobs or external cron hit).