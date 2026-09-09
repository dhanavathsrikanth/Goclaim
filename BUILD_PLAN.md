# 🗺️ OUTBID — Master Build Plan & Progress Tracker

**Product**: A general-purpose **pay-to-rank leaderboard** (inspired by outbid.lol).
Anyone submits a product URL or X handle, pays to be ranked, and the amount they pay decides their rank — nothing else. Own your spot by outbidding everyone else. #1 at the daily cutoff wins the **sponsor reward** (homepage ad slot + logo wall + social shoutout).

```
Rank is what you pay — nothing else.
```

**How money works**: Whole dollars only. Minimum bid $2. Max $999,999.
- New listing: pay `yourAmount`. Take #1 → you must pay at least `current #1 + $5`.
- Rebid on an existing listing: hypercharge only the difference (`newTotal − currentTotal`, min $1).
- One payment ranks you on **All-Time**, **Today**, **Daily**, and category boards at once.

---

## 🧰 Stack & Architecture (actual, vs original plan)

| Concern | Original plan | What we actually built | Status |
|---|---|---|---|
| Framework | Next.js (App Router) | **Next.js 16, App Router, Turbopack, Tailwind 4, TS** in `dodo-nextjs/` | ✅ |
| Database | Supabase / Railway (Postgres) | **Neon** (Lakebase Postgres 18.6), project `sparkling-resonance-70447459`, branch `production` | ✅ |
| Payments | Stripe | **Dodo Payments** (boilerplate was `@dodopayments/nextjs`) | ✅ (keys are placeholders ⚠️) |
| DB driver | — | `@neondatabase/serverless@^1.1.0` — **tagged-template syntax only** (`sql\`...\``; `sql.query(sqlString)` for raw statements; no multi-statement prepared queries) | ✅ |
| Connection URLs | `DATABASE_URL` | `DATABASE_URL` (pooled) for app · `DATABASE_URL_UNPOOLED` (direct) for `migrate.cjs` migrations | ✅ |
| Schema management | migrations | `dodo-nextjs/migrations/*.sql` applied by `node migrate.cjs` with the **direct** URL | ✅ |
| Click tracking | separate `clicks` table | counter column `click_count` on `listings` (per-day charts later need a real `clicks` table — see Phase 4.5) | ⚠️ |

**Money model**: `amount` is stored as an **integer dollar figure** (`total_bid`, `payments.amount`). Whole dollars only — floats never touch the DB.

**IDs**: `lst_...` (listings), `pay_...` (payments), generated in `checkout/route.ts`.

**Dev ports**: dev server runs on **3001** (3000 is occupied on this machine).

---

## 🚦 Global Blocker

`dodo-nextjs/.env` has **placeholder Dodo keys** (`your_api_key_here`).
Effects:
- `/api/checkout` writes the pending listing + payment to Neon, then **returns 500** at the Dodo call.
- Webhook confirmation flow was verified by simulating Dodo payloads, not real payments.

**To unblock**: paste real `DODO_PAYMENTS_API_KEY` / `DODO_PAYMENTS_WEBHOOK_KEY` into `dodo-nextjs/.env`.
Also pending: confirm Dodo's `/checkout/create` accepts inline `product_price` (may require pre-created product IDs).

---

## ✅ What's DONE & VERIFIED (as of 2026-09-08)

- **Neon wired**: linked, deployed Neon Function `api`, `DATABASE_URL*` in `dodo-nextjs/.env.local`.
- **Schema**: `listings` + `payments` (see `migrations/0001_init.sql`).
- **Data layer**: `src/lib/data.ts` fully async over Neon (`getListings`, `getListingById`, `getListingByNormalizedUrl`, `upsertListing`, `getBoardListings`, `getPayments`, `getPaymentByCheckoutSession`, `upsertPayment`).
- **Payment flow**: checkout → pending listing+payment → Dodo session → webhook `checkout.session.completed` → payment `confirmed` → listing `total_bid += amount` → listing `confirmed`. **Verified with simulated webhook** (`Example Co`, $15 → board top).
- **Boards**: All-Time / Today (24h) / Daily (UTC day) all SQL-backed and distinct. **Verified** with 5 seeded listings at staggered timestamps.
- **Click tracking**: `/api/go/[id]` increments `click_count`, strips query params, 302s. **Verified**.
- **Rules engines**: `validateBid` ($2 min, whole dollars, rebid = difference, +$5 to take #1, max $999,999) + `rankListings`.
- **Pages**: `/`, `/rules`, `/faq`, `/about`, `/listings/[id]`.
- `npm run build` passes.

---

# 📋 PHASED PLAN (0 → 14)

> Legend: `[x]` done · `[~]` partial · `[ ]` not done
> Each phase is independently shippable. **Resume here → Phase 3 (Categories).**

---

## PHASE 0 — Foundation & Setup
*Goal: Scaffold, database, payments wired.*

- [x] **0.1 Initialize Next.js (App Router)** — `dodo-nextjs/` (Next 16, Turbopack, Tailwind 4). App runs on `:3001`.
- [x] **0.2 PostgreSQL** — **Neon** project `sparkling-resonance-70447459` / branch `production`. Linked with `neon link` (`.neon` file at repo root). Neon Function `api` deployed (`hello.ts` returns "Hello from Neon Functions").
- [x] **0.3 Schema migrations** — `migrations/0001_init.sql`: `listings` + `payments`. Apply via `node migrate.cjs` (direct URL). *Plan mentioned a `clicks` table — deferred; clicks are a `click_count` counter for now.*
- [x] **0.4 Payment checkout** — **Dodo Payments** (not Stripe). `POST /api/checkout` creates a hosted session with dynamic `product_price`. ⚠️ Blocked on real keys.
- [x] **0.5 Webhook** — `POST /api/webhook` handles `checkout.session.completed` / `payment.succeeded` / fail+expire. **Verified by simulation.**
- [x] **0.6 Env layout** — `dodo-nextjs/.env.local` (DATABASE_URL, UNPOOLED, NEON_BRANCH) + `dodo-nextjs/.env` (Dodo keys, `DODO_PAYMENTS_ENVIRONMENT=test_mode`, `DODO_PAYMENTS_RETURN_URL`). **`.env*` gitignored.**

**Exit criteria**: ✅ create listing → pay → appear in DB. *(works except live payment until real keys)*

---

## PHASE 1 — Core Leaderboard (MVP)
*Goal: A pay-to-rank board you can demo.*

- [x] **1.1 Submission form** — `BidForm` on homepage hero (URL/@handle + amount). Client-side minimums checked.
- [x] **1.2 URL normalization** — `src/lib/normalize.ts`: lowercase, strip trailing slash, strip query params, `@handle` → `x.com/handle`. One canonical `normalized_url` per listing.
- [ ] **1.3 Metadata resolver** — ❌ **NOT DONE.** Currently `product_name` = hostname, `favicon_url` = Google `s2/favicons` service, `description` = `""`. **Do**: server-side fetch of page `<title>` + `<meta description>` at listing creation (fallback to hostname). Feeds SEO (Phase 7) and richer rows.
- [x] **1.4 Ranking logic** — `rankListings` (total_bid desc → older created_at wins ties). All-time board also SQL-backed via `getBoardListings("all-time")`.
- [x] **1.5 Leaderboard display** — `LeaderboardRow`: rank, favicon, name, display URL, `$total_bid`, clicks. 5s auto-refresh.
- [x] **1.6 Checkout with dynamic amount** — Dodo session in `checkout/route.ts` with `product_price: amount*100`.
- [x] **1.7 Rebid logic** — existing confirmed listing → pay **difference only** (`amount − total_bid`, min $1) in `validateBid`.
- [x] **1.8 #1 takeover rule** — to take #1 you must pay ≥ `current #1 + $5` (`TOP_BID_INSUFFICIENT`), hint surfaced in `BidForm` using all-time top (`top_bid_all`).

**Exit criteria**: ✅ submit → pay → appear live.

---

## PHASE 2 — Multiple Boards
*Goal: All-time, Today, Daily boards working.*
*Backed by `getBoardListings(board)` in `src/lib/data.ts` — SQL bucketting of **confirmed payments**, so rebids feed all boards from the moment they're paid.*

- [x] **2.1 All-time** — cumulative `total_bid`, never expires. Default board.
- [x] **2.2 Today** — rolling 24h: `sum(payments.amount) WHERE confirmed AND created_at >= now()−24h`, grouped per listing. Drops off 24h after each payment.
- [x] **2.3 Daily** — UTC calendar day: `created_at >= date_trunc('day', now())`. Midnight → midnight.
- [x] **2.4 Board switcher UI** — `BoardSwitcher` tabs (All-Time / Today / Daily). `?board=` drives the API; board-scoped top bid shown but `+$5` hint uses `top_bid_all`.
- [ ] **2.5 Daily archive page** — ❌ **NOT DONE.** Browse *past* days' boards (`?date=YYYY-MM-DD`, `created_at >= day AND < day+1 group by listing`). Payments keep `created_at`, so history stays queryable — no extra table needed yet.
- [x] **2.6 One payment ⇒ all boards** — verified: one payment appears on all of All-time/Today/Daily (if within each window).

**Exit criteria**: ✅ aggregated query verified; archive pending.

---

## PHASE 3 — Categories  ✅ **COMPLETE** → see `PHASE_3_COMPLETE.md`
*Goal: Category-specific boards.*

- [x] **3.1 Category list** — `CATEGORIES` in `src/lib/types.ts`: All, AI Tools, SaaS, Dev Tools, Crypto, Design, Startups, Other. `listings.category` column exists (default `'Other'`).
- [x] **3.2 Category picker at checkout** — category pill selector in `BidForm`; `POST /api/checkout` accepts + whitelist-validates `category`; written for new listings.
- [x] **3.3 Category board pages** — `?board=&category=` filter works end-to-end; `CategoryFilter` chip row on homepage toggles the param.
- [x] **3.4 Category filtering on homepage** — live per-category counts (board-scoped) render on the chips via `categories` in the board response.
- [x] **3.5 Category stats** — `getCategoryStats()` in `data.ts`, `GET /api/stats`, homepage "Category totals" strip (count + total bid per category).

**⚠️  Copy bug to fix**: `/rules` and `/faq` — **done in this phase** (claims now true); `rel="sponsored"` applied to the listing "Visit" link. (That's task 4.3, done early.)

**Exit criteria**: Pick category at submit → on category board + global boards. → *(est. 0.5 day)*

---

## PHASE 4 — Click Tracking  ✅ **COMPLETE** → see `PHASE_4_COMPLETE.md`
*Mostly built in the MVP; remaining work is analytics + link hygiene.*

- [x] **4.1 Redirect endpoint** — `/api/go/[id]`: increment `click_count`, 302.
- [x] **4.2 Strip query params** — `api/go/[id]` removes all `searchParams` before redirect.
- [x] **4.3 `rel="sponsored"` everywhere** — done early in Phase 3: `rel="sponsored"` on the listing page **Visit** button. `/rules` claim now true.
- [x] **4.4 Click count shown** — on `LeaderboardRow` and listing page.
- [x] **4.5 Click analytics for buyers** — `clicks` table live (`migrations/0002_clicks.sql`); every `/api/go` hit recorded via `recordClick()` (counter kept as cache); `getClicksByDay()` + `clicks_by_day` on `GET /api/listing/[id]` feed the Phase 6 chart.

**Exit criteria**: every click tracked + countable per day. → ✅ met

---

## PHASE 5 — Sponsor Ad System 🏆 *The Differentiator*  ✅ **CORE DONE** → see `PHASE_5_COMPLETE.md`
*Goal: #1 at the daily cutoff gets the homepage ad slot, logo wall, and a shoutout — the thing sponsors actually pay for.*

- [x] **5.0 Snapshot migration** — `migrations/0003_snapshots.sql` applied (`sponsor_snapshots`, PK on `(snapshot_date, rank)` = idempotency).
- [x] **5.1 Daily cron @ 00:00 UTC** — **Upstash QStash** (`Upstash-Cron: 0 0 * * *`) → `/api/cron/sponsor-snapshot` (signature-verified, `?dev=1` bypass in dev only). QStash token + signing keys in `dodo-nextjs/.env.local`. ⏳ **Post-deploy step**: create the schedule with the curl in `PHASE_5_COMPLETE.md` (QStash can't reach localhost).
- [x] **5.2 Active sponsor query** — `getActiveSponsor()` + `GET /api/sponsor`.
- [x] **5.3 Homepage ad slot** — `SponsorBanner` in hero (badge, favicon, name, winning bid, Visit).
- [x] **5.4 Logo wall** — `LogoWall` top-3 "Sponsored by" strip under hero.
- [x] **5.5 Fallback rendering** — letter avatar when no favicon; slot hidden when no snapshot exists.
- [ ] **5.6 Creative upload UI** — deferred → fold into Phase 6 (URL strings first, no upload).
- [ ] **5.7 Image storage** — deferred → needs R2 bucket + tokens.
- [ ] **5.8 Winner email** — deferred → needs Resend/Lettermail key.
- [ ] **5.9 Creative review queue** — Phase 11 hook.
- [x] **5.10 "Current sponsor" transparency** — badge + live "Ad valid until 00:00 UTC · HH:MM:SS left" countdown.

**Exit criteria (core)**: snapshot fires, #1's ad + logos show, countdown ticks. → ✅ met (cron verified via manual trigger; QStash schedule creation waits for deploy)

---

## PHASE 6 — Buyer Dashboard  ✅ **COMPLETE** → see `PHASE_6_COMPLETE.md`
*Goal: Post-purchase experience. Everything needs a lightweight "claim" identity (Phase 6.8) since payments are guest.*

- [x] **6.1 `/dashboard`** — verified-claim token unlocks the visitor's listings (`GET /api/dashboard?claim=`).
- [x] **6.2 Rank per board** — All-Time / Today / Daily ranks per listing (reuses `getBoardListings`).
- [x] **6.3 Click analytics** — totals + 14-day bar chart from the `clicks` table.
- [x] **6.4 Ad slot status** — "👑 LIVE until 00:00 UTC" vs "win #1 before midnight" (from snapshots).
- [x] **6.5 One-click "Raise Bid"** — `/?raise=<id>` prefills `BidForm` (url + total+1).
- [x] **6.6 Payment history** — per-listing transactions.
- [x] **6.7 Creative upload** — banner/logo URL form per listing → owner-only `PUT /api/listing/[id]` (pairs with 5.6; R2 upload still pending in 5.7).
- [x] **6.8 Claim/session system** — HMAC claim tokens (`src/lib/claim.ts`, `CLAIM_SECRET` in `.env.local`); webhook sets `claim_email`; return_url → `/payment/success?listing=&pay=`; `/api/payment/claim` exchanges the unguessable pay id for a token (202 while pending, 404/401 guarded).

**Exit criteria**: pay → land on dashboard → see rank, clicks, ad status, raise bid. → ✅ met (via simulated webhook; live Dodo still needs real keys)

---

## PHASE 7 — Listing Pages  ✅ **COMPLETE** → see `PHASE_7_COMPLETE.md`
*Already mostly live; the rest is SEO + discovery.*

- [x] **7.1 Listing page** — detail body extracted to `src/app/listings/ListingDetail.tsx` (name, URL, description, bid, rank, clicks, listed date).
- [x] **7.2 Open Graph / meta** — `generateMetadata` on the slug route: title, description, canonical, OG + twitter cards; image prefers buyer creatives (`banner_url` → `logo_url` → `favicon_url`). `NEXT_PUBLIC_SITE_URL` in `.env`.
- [x] **7.3 Visit button** — routes through `/api/go/[id]` (tracked) with `rel="sponsored"`.
- [x] **7.4 Related listings** — `RelatedListings` ("More in {category}", top 4 by bid) + `LeaderboardRow` rows now link to listing pages (they were orphaned before).
- [x] **7.5 SEO-friendly URLs** — `/listings/[slug]` (`0005_slugs.sql`, `slugify` + `uniqueSlug` in checkout, partial unique index); old `/listings/<id>` URLs **308** to canonical slugs; unknown slugs → real 404. (`[id]/` dir removed — Next.js forbids sibling `[id]` + `[slug]` routes; single `[slug]` route handles both.)

**Exit criteria**: shareable, indexable pages. → ✅ met

---

## PHASE 8 — Hall of Fame  ✅ **COMPLETE** → see `PHASE_8_COMPLETE.md`
*Goal: permanent archive of past #1 winners (drawn from snapshots).*

- [x] **8.1 `/hall-of-fame` page** — server-rendered, with metadata; nav links added in header ("🏆 Winners") + footer (page was orphaned).
- [x] **8.2 Populate from `sponsor_snapshots`** (auto) — `getHallOfFame()` reads rank-1 rows, newest first; fills itself once the Phase 5 cron is live.
- [x] **8.3 Rich entries** — logo (buyer logo → favicon → letter), name, URL, amount paid, date, clicks during slot (windowed count).
- [x] **8.4 Filter** — `?filter=week/month/all` (7d / 30d / all), server-side, invalid → all.
- [x] **8.5 Link to listing pages** — entries link to `/listings/<slug>`.

**Exit criteria**: past winners honored permanently. → ✅ met (implementation pre-existed as scaffolding; this phase verified E2E, wired discovery, documented)

---

## PHASE 9 — Public Pages & Content  ✅ **COMPLETE** → see `PHASE_9_COMPLETE.md`
- [x] **9.1 `/rules`** — complete. Full claim audit this phase: "no ads" → "no third-party ads" (Phase 5 banner); chat-link rule now enforced in code.
- [x] **9.2 `/faq`** — complete. "Frozen in the archive" (never existed) → points to Hall of Fame.
- [x] **9.3 `/about`** — complete. Ads qualifier applied.
- [x] **9.4 `/stats`** — live counters page (`getPublicStats()`: confirmed revenue, listings, clicks, top bid, categories) + footer link.
- [x] **9.5 Footer links** — all pages linked (incl. Stats).

→ *(0.5 day)*

---

## PHASE 10 — Social & Viral Mechanics  ✅ **CORE DONE** → see `PHASE_10_COMPLETE.md`
- [x] **10.2 "Share your rank" card** — `/api/og/rank/[id]` PNG (`@vercel/og`) + X-intent/copy buttons on listings; card leads og:image.
- [x] **10.3 Activity feed** — `getRecentActivity()` (bids/joins/crowns); `/api/activity`, `/activity` page, homepage strip (replaced updated_at version).
- [x] **10.4 Revenue milestone counter** — homepage strip (lifetime revenue → next $1k); `/api/stats` += `totals`.
- [x] **10.5 "Viewing now"** — `presence` table (`0006`), heartbeat API, homepage counter.
- [ ] **10.1 Auto-post #1 announcements** — deferred → needs X API/Buffer credentials.
- Housed under admin: new **Viral** section in the existing `/admin` (card preview, milestone, viewers, activity).

→ *(credential-free core done; 10.1 pending keys)*

---

## PHASE 11 — Admin & Operations  ✅ **COMPLETE** → see `PHASE_11_COMPLETE.md`
- [x] **11.1 Admin dashboard** — existed; added per-row remove/restore (`PATCH /api/admin/listings/[id]`, session-gated).
- [x] **11.2 Listing moderation** — same actions; removed listings vanish from boards (verified).
- [x] **11.3 Ad creative approval queue** (from 5.9) — `#creatives` section; `creative_approved` flag (`0007`); approved banners render on the ad slot; reject clears URLs.
- [x] **11.4 Manual cron trigger** — `POST /api/admin/cron` + `#ops` section with snapshot health badge.
- [x] **11.5 Monitoring/alerts** — failed / stale-pending / viewers cards (display; external paging needs keys).
- [x] **11.6 Analytics** — conversion %, 7d joins, top categories (DB-derived; PostHog app-side not installed).

## PHASE 10 — remainder ✅
- [x] **10.1 Auto-post #1** — was already wired in the cron route (verified live, simulation mode); real posts need Composio key + Twitter connection.

→ *(1 day)*

---

## PHASE 12 — Polish & Launch Prep  ✅ **CODE DONE** → see `PHASE_12_COMPLETE.md`
- [x] **12.1 Mobile responsive audit** — tile overflow, breaks, FaviconImg hazard, brand leftover fixed; rest verified.
- [x] **12.2 Loading / error / empty states** — added global `error.tsx` + `not-found.tsx`; all states verified.
- [ ] **12.3 Dodo test → live mode** — blocked: needs your real keys.
- [ ] **12.4 Domain + DNS + SSL** — skipped per user (goclaim.space).
- [ ] **12.5 Performance audit** — skipped per user (run on deployed URL).
- [x] **12.6 Security review** — clean except one real hole (unsigned Dodo webhooks) which is now closed + E2E-proven.
- [ ] **12.7 Rules page legal pass** — needs a human.
- [ ] **12.8 Pre-launch build-in-public** / **12.9 Launch tweet** — content, on you.

→ *(1 day)*

---

## PHASE 13 — Launch  ⬅️ **DEPLOYED to workers.dev** → see `CLOUDFLARE_DEPLOY.md`
- [x] **13.0 Cloudflare prep (code)** — adapter + wrangler + OG fallback + CI workflow done.
- [x] **13.1 Deploy** — LIVE 2026-09-09 at https://goclaim-space.22211a0112.workers.dev (11 secrets pushed, all routes verified). Left: custom domain (no zone yet — user), Dodo URL updates, QStash schedule.
- [ ] **13.2 Launch tweet**
- [ ] **13.2 Launch tweet**
- [ ] **13.3 Quote-tweet updates every 2–4h**
- [ ] **13.4 Real-time monitoring** (payments/errors/traffic)
- [ ] **13.5 Engage every mention/screenshot**
- [ ] **13.6 First revenue milestone post**
- [ ] **13.7 Announce every #1 change**

---

## PHASE 14 — Post-Launch Iteration
- [ ] **14.1 Feedback loop** (DMs/emails/X)
- [ ] **14.2 Leaderboard takeover feature** (2× #1 price, 3h lock)
- [ ] **14.3 Daily email digest** (winner recap)
- [ ] **14.4 Category ad rotations** (when categories get big)
- [ ] **14.5 Public read-only board API**
- [ ] **14.6 Referral system** (refer a bidder → credit)

---

## 📊 Progress Board

```
Phase 0 Foundation ......... ✅ done
Phase 1 Core MVP ........... ✅ done (1.3 metadata pending)
Phase 2 Boards ............. ✅ done (2.5 archive pending)
Phase 3 Categories ......... ✅ done → SEE `PHASE_3_COMPLETE.md` (4.3 done early)
Phase 4 Click tracking ..... ✅ done → SEE `PHASE_4_COMPLETE.md`
Phase 5 Sponsor ads ........ ✅ core done → SEE `PHASE_5_COMPLETE.md` (5.6-5.9 deferred; QStash schedule = post-deploy step)
Phase 6 Buyer dashboard .... ✅ done → SEE `PHASE_6_COMPLETE.md`
Phase 7 Listing pages ...... ✅ done → SEE `PHASE_7_COMPLETE.md`
Phase 8 Hall of Fame ....... ✅ done → SEE `PHASE_8_COMPLETE.md`
Phase 9 Public pages ........ ✅ done → SEE `PHASE_9_COMPLETE.md`
Phase 10 Viral ............. ✅ done (10.1 wired, sim mode until X keys; OG now static fallback — see CLOUDFLARE_DEPLOY.md)
Phase 11 Admin ............. ✅ done → SEE `PHASE_11_COMPLETE.md`
Phase 12 Polish ............ ✅ code done → SEE `PHASE_12_COMPLETE.md` (12.3 keys, 12.4 DNS, 12.7 legal on you)
Phase 13 Launch ............ ⬅️ NEXT  (deploy + launch-day ops)
Phase 13 Launch ............ ⬜ not started
Phase 14 Iteration ......... ⬜ not started
```

**Estimated time to launch**: ~12–13 working days total; roughly 9–10 remaining.

---

## 🔁 HOW TO RESUME

```bash
# 1) App
cd dodo-nextjs
npm run dev          # → http://localhost:3001
npm run build        # type/build check

# 2) DB (applies all migration files with the DIRECT url)
node migrate.cjs

# 3) Neon CLI (infra)
neon link            # already linked: project sparkling-resonance-70447459 / branch production
neon config plan && neon config apply / neon deploy   # Neon Functions (repo root: neon.ts, hello.ts)
```

**Where things live**
- App code: `dodo-nextjs/src` · API routes: `src/app/api/*` · Data layer: `src/lib/data.ts` · Rules: `src/lib/validation.ts` + `ranking.ts` · Schema: `migrations/*.sql`.
- Repo root: `neon.ts` / `hello.ts` (Neon Functions), `.neon` (Neon context), `BUILD_PLAN.md` (this file).

**Conventions to keep**
- Whole-dollar integers only for money.
- Tagged-template `sql\`...\`` for parameterized queries (v1 driver rejects `sql("...", [params])`).
- Migrations: one `migrations/XXXX_name.sql` per change → run `node migrate.cjs`. Direct URL only.
- Test data pattern: seed via `seed2.cjs`-style script, verify via API, **always cleanup**, keep DB empty for real testing.

**Known debts / gotchas**
- Dodo keys are placeholders → real checkout is a 500 after DB write until keys land.
- `/rules` + `/faq` tempt you: they claim category boards & `rel="sponsored"` that don't exist yet. Fix after Phase 3 / 4.3.
- React/Next warnings: `v4` import removed; `useState useState(false)` typo fixed; `sharp` install script not approved (harmless, build still passes).
- Port 3000 taken on this machine — always use 3001 for dev.
- Neon suspend timeout 0: DB stays warm (no cold-start).