# Phase 12 Complete (Code Items) — Polish & Launch Prep

**Date:** 2026-09-09
**Status:** All code-doable items done. Skipped per user: 12.4 (DNS), 12.5 (perf audit). Blocked on user: 12.3 (Dodo keys), 12.7 (legal), 12.8/12.9 (content).

## 12.1 Responsive fixes
- `ListingDetail` stat tiles: `text-2xl` overflowed at 360px for 5+-figure bids (tile content ~53px) → `text-lg sm:text-3xl`, `p-3 sm:p-4`, `min-w-0`, `break-all`. Long names/URLs: `break-words`/`break-all`.
- `stats` tiles: `break-all` on values.
- `LeaderboardRow` inline `img onError` → `FaviconImg` client component (same server/client hazard class fixed in Phase 10; preemptive).
- Found + fixed leftover `outbid.lol` brand in `PublicSidebar` (JSX-split, missed by text grep).
- Audited, no changes needed: BidForm (stacks), BoardSwitcher, CategoryFilter (h-scroll), dashboard (flex-wrap), hall-of-fame/activity rows, Header/Footer mobile menu, admin tables (overflow-x).

## 12.2 States
- Added global `error.tsx` (retry + board links) and `not-found.tsx` (slug 404s now render branded 404).
- Verified: skeletons (home), spinners (dashboard/success), invalid-link + empty states (dashboard), empty states (hall/activity), methodical copy (stats shows 0s).

## 12.6 Security review — one real hole found and closed
- ✅ SQLi: zero `sql.query(` in app code — all parameterized tagged templates. Only `dangerouslySetInnerHTML` is the static theme script. No eval. All user content rendered as escaped React text. Claim/QStash HMACs timing-safe.
- ❌→✅ **Dodo webhook accepted unsigned payloads** — anyone could forge `payment.succeeded` and mint rank without paying. Fixed: `src/lib/dodoWebhook.ts` implements Standard Webhooks verification (`webhook-id/ts/signature` headers, HMAC-SHA256, 5-min replay tolerance); route enforces with 401 when a real secret is configured, dev-bypass with warning on placeholder keys (keeps simulated testing working). Raw body preserved for signing (`req.text()` + parse).
- Verified E2E with env-overridden test key: unsigned→401, badsig→401, stale→401, valid→200 + confirm + claim_email. (Debug lines removed after.)
- Redirect audit: `/api/go` scheme-locks to https (JS/data-URI inputs die as unresolvable hosts); slug redirects DB-driven; admin login static paths.
- Noted, not code-fixable: no rate limiting (rely on host), admin PATCH needs a live session to execute (gates tested).

## Functional E2E (fresh server, correct port)
All pages/APIs 200; checkout matrix (new→Dodo-500, blocked→400, rebid-low→400 with exact message, min→400); go-click recorded; OG PNG; presence; activity; sponsor; stats totals (pending excluded); admin 401s; login redirect.

## Incidents worth remembering
1. **Stale server on :3000** serving an old build while the new one took :3001 (lock contention). Symptom: phantom 500s. Fix: kill by PID (match `start-server.js`, not just `next dev`), clear `.next/dev/lock`, always confirm the `Local:` line — never assume the port.
2. **funone vs funcone**: a test-URL typo looked like a validation regression. Always diff test input against seed data before blaming code.
3. **PowerShell rapid-fire POSTs** fail at transport level (stale keep-alive vs dev server). Single calls or 2s pauses work.
4. **`set VAR=val && ...` via Start-Process appends a trailing space** to the value (proved: 20 chars vs 19). Use `set "VAR=val"` quoted form.

## Files changed
- `src/app/listings/ListingDetail.tsx`, `src/app/stats/page.tsx`, `src/app/components/{LeaderboardRow,PublicSidebar}.tsx`
- `src/app/{error.tsx,not-found.tsx}` (new)
- `src/lib/dodoWebhook.ts` (new), `src/app/api/webhook/route.ts` (verify + typing)

## Left for launch
- 12.3 Dodo keys → flip to live, re-run webhook matrix against test mode first.
- 12.4 DNS/SSL for goclaim.space; then create the QStash schedule + verify cron.
- 12.5 Lighthouse pass on the deployed URL (dev numbers don't count).
- 12.7 Legal read of /rules; 12.8/12.9 content.

## Next
Phase 13 — Launch (deploy + launch-day ops). Phase 14 — Iteration.