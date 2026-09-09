# Phase 10 Complete (Credential-Free Core) — Social & Viral

**Date:** 2026-09-09
**Status:** Done — 10.2–10.5 public + housed under the existing admin panel. 10.1 (X auto-post) waits on credentials.

## Decision (per user: "decide yourself, admin page will be there")
An admin area **did** exist (`/admin`, Neon-Auth email-gated, with Overview/Listings/Payments + Composio). So: 10.2–10.5 ship as **public features** (virality requires it) and their **ops side lives in the admin panel** as a new "Viral" section. No duplicate admin built.

## Actions taken

### 10.2 Share-your-rank card
- `GET /api/og/rank/[id]` (new, `@vercel/og@1.0.2`) — 1200×630 PNG: name, bid, site, branding. Pitfall fixed: Satori demands explicit `display:flex` on multi-child divs (was 500).
- `ShareButtons` (new, client): 𝕏 intent link + copy-link, on every listing page.
- Listing `og:image`/`twitter:image` now lead with the generated card (buyer creative second).

### 10.3 Activity feed
- `getRecentActivity()` — merges confirmed bids + joins + #1 crowns, newest first.
- `GET /api/activity`, server-rendered `/activity` page (metadata included), compact `ActivityFeed` strip on homepage (latest 6 + "View all"). Replaced the old updated_at-based "Latest activity" (dead `recent`/`timeAgo` code removed).

### 10.4 Revenue milestone
- `MilestoneStrip` on homepage: lifetime confirmed revenue (via `/api/stats` totals) + progress to next $1k milestone.
- `/api/stats` extended **additively** with `totals` (existing `categories` shape untouched).

### 10.5 Viewers-now
- `migrations/0006_presence.sql` (applied): `presence(client_id pk, path, last_seen)` + index.
- `touchPresence()`/`getPresenceCount()`; `GET+POST /api/presence` (POST upserts heartbeat, prunes >10min stale, returns viewers = active in last 2min).
- Homepage pings every 30s (localStorage client id); "● N viewing" in the stats bar (hidden at 0).

### Admin "Viral" section (`/admin#viral` + sidebar link)
Share-card preview of current #1, milestone progress, viewers-now, latest-activity list — all in existing admin styling.

### Bug fixed along the way
Adding a client component under `ListingDetail` tripped React's "event handlers can't be passed to Client Component props" on the inline `img onError`. Extracted client `FaviconImg` (self-hiding on error) and used it in `ListingDetail` + `RelatedListings`.

## Verification
- `npm run build` — passes (all new routes registered).
- Seed (2 listings, 2 payments, 1 crown):
  - OG: **200 image/png 23KB** (after flex fix).
  - `/api/activity`: crown/bid/join all present, newest first — over real pre-existing rows too.
  - Presence: POST → `{viewers:1}`, GET → 1.
  - Listing page **200** with X-intent, copy button, og-card URL (after FaviconImg fix).
  - `/activity` page shows entries; `/api/stats` totals reconcile (`revenue 850 = 670 pre-existing + 180 seed`, pending excluded).
- All test data cleaned (incl. `test-*` presence rows); temp scripts deleted; dev server stopped.

## Files changed/added
- `migrations/0006_presence.sql`; `package.json` (+@vercel/og)
- `src/lib/types.ts` (`ActivityItem`); `src/lib/data.ts` (`getRecentActivity`, presence fns)
- `src/app/api/og/rank/[id]/route.tsx`, `src/app/api/activity/route.ts`, `src/app/api/presence/route.ts`
- `src/app/api/stats/route.ts` (+totals), `src/app/activity/page.tsx`
- `src/app/components/{ShareButtons,ActivityFeed,MilestoneStrip,FaviconImg}.tsx`, `Footer.tsx` (+Activity)
- `src/app/listings/{ListingDetail,[slug]/page}.tsx`, `src/app/components/RelatedListings.tsx`
- `src/app/page.tsx` (strip, feed, presence, dead-code removal)
- `src/app/admin/{page.tsx,components/AdminSidebar.tsx}` (Viral section)

## Deferred
- **10.1 X auto-post** — needs X API/Buffer credentials. The admin Composio card already hints at this path.

## Next
Phase 11 — Admin & Operations (dashboard exists; needs moderation 11.1–11.3, manual cron 11.4, monitoring 11.5–11.6).