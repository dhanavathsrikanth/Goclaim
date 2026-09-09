# Phase 3 Complete — Categories

**Date:** 2026-09-08
**Status:** Done — shipped, tested end-to-end, no blockers.

## What Phase 3 delivered

Bid listings now have a **category**, and the leaderboard can be filtered by category on every time board (all-time / today / daily). A homepage breakdown shows per-category totals.

## Actions taken

### 1. Checkout accepts + validates a category (task 3.2)
- `src/app/api/checkout/route.ts`:
  - Reads `category` from the request body.
  - Validates it against the `CATEGORIES` whitelist (defined in `src/lib/types.ts`), minus "All".
  - Falls back to `"Other"` when missing/invalid.
  - New listings (pending) are created with the chosen category.
- `src/app/components/BidForm.tsx`:
  - Added a category pill selector (excludes "All"); selection is sent in the checkout request body.

### 2. Data layer — category stats (task 3.5, base)
- `src/lib/data.ts`: added `getCategoryStats()` — SQL `GROUP BY category` over confirmed listings returning `{ category, count, totalBid }`, ordered by total bid desc.

### 3. Category API (task 3.5)
- New endpoint `src/app/api/stats/route.ts` (`GET /api/stats`) → `{ categories: [{ category, count, totalBid }] }`.

### 4. Board filtering + homepage UI (tasks 3.3 / 3.4)
- `src/app/api/board/route.ts`:
  - Accepts `?category=` (whitelisted; "All"/empty = no filter).
  - Returns `categories` — per-category listing counts for the current board (computed from the unfiltered board rows, so chip counts stay board-scoped).
- `src/app/components/CategoryFilter.tsx` (new): pill row of all categories with live per-category counts; active pill highlighted. Counts come from the board response.
- `src/app/page.tsx`:
  - `category` state; board fetches include `?category=` (only when not "All").
  - CategoryFilter rendered between the stats bar and the leaderboard.
  - Per-category totals strip ("Category totals") fed by `/api/stats`.

### 5. Copy / collateral fixes
- `rel="sponsored"` added to the listing page "Visit" button (`src/app/listings/[id]/page.tsx`) — this makes the existing `/rules` claim truthful (task 4.3 done early, one-liner).
- `/rules` and `/faq` copy now matches reality — no overclaiming.

## Verification

- `npm run build` — passes.
- Seeded 5 confirmed listings across SaaS (2), Dev Tools, AI Tools, Other.
  - `GET /api/board` → total=5, top=$120, `categories: {SaaS:2, Dev Tools:1, AI Tools:1, Other:1}`.
  - `GET /api/board?category=SaaS` → only the 2 SaaS listings (ranked $120, $60).
  - `GET /api/board?board=today&category=AI%20Tools` → only the AI Tools listing.
  - `GET /api/stats` → `{SaaS:{count:2,totalBid:180}, Dev Tools:{count:1,totalBid:85}, AI Tools:{count:1,totalBid:40}, Other:{count:1,totalBid:15}}`.
  - `POST /api/checkout` with `category:"Design"` → pending listing row written with `category=Design` (request then 500s at the Dodo call because keys are placeholders — expected).
- All test data cleaned up afterward; DB left empty; temp scripts deleted; dev server stopped.

## Files changed

- `dodo-nextjs/src/app/api/checkout/route.ts`
- `dodo-nextjs/src/app/components/BidForm.tsx`
- `dodo-nextjs/src/app/components/CategoryFilter.tsx` (new)
- `dodo-nextjs/src/app/api/board/route.ts`
- `dodo-nextjs/src/app/api/stats/route.ts` (new)
- `dodo-nextjs/src/lib/data.ts`
- `dodo-nextjs/src/app/page.tsx`
- `dodo-nextjs/src/app/listings/[id]/page.tsx` (rel="sponsored")

## Next

Phase 4 — checkout improvements and payment hardening (Dodo keys, webhook signing, refund/failed handling). Phase 4.3 (`rel="sponsored"` on outbound links) is already done.