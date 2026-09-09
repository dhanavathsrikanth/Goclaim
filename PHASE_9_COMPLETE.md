# Phase 9 Complete — Public Pages & Content

**Date:** 2026-09-09
**Status:** Done — 9.4 built, all five tasks verified (9.1/9.2/9.3/9.5 pre-existing, re-audited).

## Actions taken

### 1. Full content audit (9.1/9.2/9.3) — 3 real issues found and fixed
Audited every claim on `/rules`, `/faq`, `/about` against the actual code (`validation.ts`, `ranking.ts`, go route, snapshots):
- ✅ True: $2 min / whole dollars / $999,999 max / +$5 for #1 / rebid pays difference / ties go to older bid / category boards / product pages / `rel="sponsored"` / query stripping / rolling-24h Today / UTC-day Daily.
- ❌→✅ **"No ads" was false** — Phase 5 added the winner's banner ad slot. Qualified to **"no third-party ads"** in 4 spots: `/rules`, `/about`, `/faq` (Q1), `layout.tsx` site description. (Homepage hero had already been restyled; no claim left there.)
- ❌→✅ **"Chat and invite links are not allowed" was unenforced** — no validation existed. Implemented `isBlockedHost()` in `validation.ts` (telegram.me, t.me, whatsapp.com, chat.whatsapp.com, discord.gg, discord.com, messenger.com, m.me, signal.me; subdomain-aware) + `URL_NOT_ALLOWED` error surfaced in checkout as "Chat and invite links can't be listed."
- ❌→✅ **"stay frozen in the archive" was false** — no daily archive UI exists (2.5 still pending). Rewrote to point at what does exist: "each day's #1 is immortalized in the Hall of Fame."

### 2. `/stats` page (9.4)
- `getPublicStats()` in `data.ts` — single round trip: revenue (sum of **confirmed** payments), confirmed listings, `clicks`-table count, max bid, distinct categories.
- `src/app/stats/page.tsx` (new, server-rendered + metadata): 5 tiles + "Bid →" CTA tile + methodology footnote.
- Footer: added Stats link (9.5 — all pages linked).

## Verification

- `npm run build` — passes (`○ /stats`).
- Seeded controlled data (revenue 175 incl. a pending 999 that must not count, 2 listings, 4 clicks, top 100, 2 categories) **on top of 5 pre-existing confirmed rows + 1 pending row not created by any recorded phase** (cursor/linear/resend/supabase/v0 + an x.com handle — left untouched, see below).
  - Page showed **$845 / 7 / 4 / $250 / 4** — reconciles exactly: 670 pre-existing + 175 seeded revenue, pending 999 correctly excluded, clicks all from seed. Proves correct aggregation over mixed real data.
  - `POST /api/checkout {url: t.me/somegroup}` → **400 "Chat and invite links can't be listed."**
  - All public pages **200**: `/`, `/rules`, `/faq`, `/about`, `/stats`, `/hall-of-fame` (+ dashboard invalid-claim state).
- My seed rows cleaned; temp scripts deleted; dev server stopped.

## ⚠️ Open question — mystery rows in Neon
`listings`/`payments` contain **6 rows no recorded phase created** (5 confirmed: cursor.com $250, linear.app $45, resend.com $110, supabase.com $180, v0.dev $85; 1 pending: x.com/rathod0137 $11 + its pending payment). Prior phase docs all claim "DB left empty," so these are either your own manual testing or a cleanup that missed. **I left them untouched.** Tell me to keep or wipe them.

## Files changed
- `dodo-nextjs/src/lib/validation.ts` (`isBlockedHost`, `URL_NOT_ALLOWED`)
- `dodo-nextjs/src/app/api/checkout/route.ts` (error message)
- `dodo-nextjs/src/app/rules/page.tsx`, `src/app/about/page.tsx`, `src/app/faq/page.tsx`, `src/app/layout.tsx` (copy)
- `dodo-nextjs/src/lib/types.ts` (`PublicStats`), `src/lib/data.ts` (`getPublicStats`)
- `dodo-nextjs/src/app/stats/page.tsx` (new)
- `dodo-nextjs/src/app/components/Footer.tsx` (Stats link)

## Notes / debts
- `t.me`-style blocks match the rules copy as written; revisit the list if over-blocking legit uses.
- Phase 2.5 (daily archive UI) is still pending — the FAQ no longer promises it.

## Next
Phase 10 — Viral (share buttons, OG-image upgrade, referral/winner shoutouts).