# Phase 7 Complete — Listing Pages

**Date:** 2026-09-08
**Status:** Done — all 5 tasks shipped (7.1/7.3 were already live), tested end-to-end.

## What shipped

Listing pages are now SEO- and discovery-ready: shareable OG cards, same-category related row, human-readable slug URLs with permanent redirects from old id URLs, and leaderboard rows that actually link to them (they were previously orphaned — reachable only by direct URL).

## Actions taken

### 1. Slug foundation (7.5, base)
- `migrations/0005_slugs.sql` (applied): `listings.slug` + partial unique index (`where slug <> ''`, tolerates legacy unslugified rows).
- `src/lib/normalize.ts`: `slugify()` — `https://s1.example/` → `s1-example`, `https://x.com/handle` → `x-com-handle` (lowercase alnum + hyphens, 60 chars).
- `src/lib/data.ts`: `slug` through `rowToListing`/`upsertListing`; new `getListingBySlug()` and `getRelatedListings()` (same category, confirmed, exclude self, top 4 by bid).
- `src/app/api/checkout/route.ts`: new listings get `uniqueSlug()` (base, then `-xxxx` suffix on collision, timestamp fallback).

### 2. Routes (7.5)
- `src/app/listings/[slug]/page.tsx` (new): resolves slug — or `lst_*` id → **308 `permanentRedirect`** to the canonical slug URL; unknown/removed → real `notFound()` (HTTP 404). Renders shared detail + rank + related.
- `src/app/listings/[id]/` **deleted** — Next.js forbids sibling `[id]` + `[slug]` dynamic routes; the single `[slug]` route preserves old `/listings/<id>` URLs via the 308 above, which is exactly what the plan asked ("keep [id] working via redirect").
- `src/app/listings/ListingDetail.tsx` (new): extracted page body, now with the related section.

### 3. Metadata (7.2)
- `generateMetadata` on the slug route: `{name} — $${bid} bid | outbid.lol`, description with bid/category, `canonical`, `openGraph` + `twitter: summary_large_image`. OG image prefers buyer creatives (`banner_url` → `logo_url` → `favicon_url`), wiring Phase 6 output into share cards.
- `NEXT_PUBLIC_SITE_URL` added to `dodo-nextjs/.env` (localhost default, override on deploy).

### 4. Discovery (7.4)
- `src/app/components/RelatedListings.tsx` (new): "More in {category}" card grid linking to slug URLs.
- `LeaderboardRow`: rows are now `<Link>`s to `/listings/<slug>` (falls back to id when slug empty) — listing pages are crawlable from the homepage.

## Verification

- `npm run build` — passes (`ƒ /listings/[slug]`).
- Seed: 4 confirmed listings (3 SaaS, 1 AI Tools).
  - `/listings/g-one` → **200**, HTML contains `og:title`, `canonical`, related cards (GTwo, GThree).
  - `/listings/lst_g1` → **308** → `/listings/g-one`.
  - `/listings/nope-nothing` → **404**.
  - `/api/board` returns `slug` on every listing (client row links resolve; raw homepage HTML has no links only because the board renders client-side).
  - `POST /api/checkout` (fresh URL) → 500 at Dodo as expected **after** writing the row with slug `freshslugtest-example` (real production path for `slugify` + `uniqueSlug`).
- All test data cleaned (DB empty); temp scripts deleted; dev server stopped.

## Files changed

- `dodo-nextjs/migrations/0005_slugs.sql` (new)
- `dodo-nextjs/src/lib/normalize.ts` (`slugify`)
- `dodo-nextjs/src/lib/types.ts`, `src/lib/data.ts` (`slug`, `getListingBySlug`, `getRelatedListings`)
- `dodo-nextjs/src/app/api/checkout/route.ts` (`uniqueSlug`)
- `dodo-nextjs/src/app/listings/[slug]/page.tsx` (new, metadata + resolve + redirect)
- `dodo-nextjs/src/app/listings/ListingDetail.tsx` (new, extracted)
- `dodo-nextjs/src/app/listings/[id]/` (deleted)
- `dodo-nextjs/src/app/components/RelatedListings.tsx` (new)
- `dodo-nextjs/src/app/components/LeaderboardRow.tsx` (row → Link)
- `dodo-nextjs/.env` (`NEXT_PUBLIC_SITE_URL`)

## Notes / debts

- OG images reuse favicon/creative URLs (64px Google favicons look small in large cards). Proper generated OG images (bid + rank rendered) are a future upgrade.
- Legacy rows with `slug = ''` render without redirect and link by id — run a one-off backfill before launch if any exist.
- Homepage link check must go through `/api/board` (client-rendered board isn't in SSR HTML).

## Next

Phase 8 — Hall of Fame (blocked on 5.1 live snapshots; build past-winners wall from `sponsor_snapshots`).