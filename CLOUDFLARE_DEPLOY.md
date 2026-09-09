# Cloudflare Deploy Handoff — goclaim.space on Workers

**Status:** ✅ **DEPLOYED 2026-09-09** → https://goclaim-space.22211a0112.workers.dev
(all routes verified live). Remaining: custom domain (needs you) → Dodo URL
updates → QStash schedule.

## What was done
- `@opennextjs/cloudflare@1.20.6` + `wrangler@4` installed; `wrangler.jsonc`
  (worker `goclaim-space`, `nodejs_compat`), minimal `open-next.config.ts`
  (no ISR in use), `next.config.ts` dev hook, `preview`/`deploy` scripts,
  `.dev.vars` (gitignored, prefilled), `src/proxy.ts` placeholder (Next 16
  emits manifests without a middleware bundle and the adapter hard-fails
  without one — matcher never matches, zero runtime effect).
- OG: `@vercel/og` can't run on Workers; `workers-og` is uninstallable under
  Turbopack; `cf-workers-og` builds but its WASM init does `fs.readFile` at
  request time on workerd. → Listing `og:image` is now the pre-rendered
  `public/og-fallback.png` (verified PNG, correct branding); per-listing text
  stays in title/description. Dynamic PNGs = follow-up when the toolchain
  allows. Both OG deps uninstalled.
- `.github/workflows/deploy.yml` — CI builds + deploys on push to `main`
  (touches `dodo-nextjs/**`), or manual dispatch.
- No app-code changes were needed for the runtime: Neon (fetch driver),
  QStash, Dodo, `node:crypto` all work under `nodejs_compat`.

## Proven on local workerd (`preview`, port 8787)
`/` · `/api/board` (Neon reads) · `/listings/lst_*` → 308 → slug → 200 ·
`/og-fallback.png` static · `/activity` · `/stats` · `/hall-of-fame` ·
`/api/sponsor` · presence POST (Neon write+prune) → `{viewers:1}` ·
`/api/payment/claim` bad-pair → 404 (HMAC path live). Not runnable without
real keys/sessions: QStash signature, Dodo webhook signature, Neon Auth login,
live Dodo checkout (same as local — unchanged code paths).

## 1. One-time Cloudflare setup — ✅ DONE (your account already authed via wrangler OAuth)
Worker `goclaim-space` live at https://goclaim-space.22211a0112.workers.dev.
11 runtime secrets pushed 2026-09-09 (DATABASE_URL, Dodo ×2, QStash ×3,
CLAIM_SECRET, COMPOSIO_API_KEY, NEON_AUTH ×2, ADMIN_EMAIL).

## 2. Runtime secrets — ✅ DONE (pushed 2026-09-09 via byte-exact stdin script)
```bash
cd dodo-nextjs
npx wrangler login
npx wrangler secret put DATABASE_URL
npx wrangler secret put DODO_PAYMENTS_API_KEY
npx wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY
npx wrangler secret put QSTASH_TOKEN
npx wrangler secret put QSTASH_CURRENT_SIGNING_KEY
npx wrangler secret put QSTASH_NEXT_SIGNING_KEY
npx wrangler secret put CLAIM_SECRET
npx wrangler secret put COMPOSIO_API_KEY
npx wrangler secret put NEON_AUTH_BASE_URL
npx wrangler secret put NEON_AUTH_COOKIE_SECRET
npx wrangler secret put ADMIN_EMAIL
```
(`NEXT_PUBLIC_SITE_URL` is baked at build time — already `https://goclaim.space`
in CI env + local `.env`. `DATABASE_URL_UNPOOLED` is only used by `migrate.cjs`,
never by the app — do not deploy it.)

## 3. Deploy — ✅ DONE (opennext build + deploy 2026-09-09, version live at 100%)
Re-deploy anytime: `cmd /c "node_modules\.bin\opennextjs-cloudflare.cmd deploy"`
from `dodo-nextjs/` (uses the direct shim — `npx` flakes after process kills).
CI (`.github/workflows/deploy.yml`) still needs `CLOUDFLARE_API_TOKEN` +
`CLOUDFLARE_ACCOUNT_ID` repo secrets if you want push-to-deploy.

## 4. Custom domain (closes 12.4) — ⏳ NEEDS YOU
No `goclaim.space` zone on Cloudflare yet (checked 2026-09-09). Steps:
dash.cloudflare.com → Add domain → `goclaim.space` → change nameservers at
your registrar → Workers & Pages → `goclaim-space` → Settings → Domains &
Routes → Add `goclaim.space` (+ `www`, redirect to apex). Free SSL automatic.
Then:
- Dodo dashboard → checkout `return_url` + webhook endpoint →
  `https://goclaim.space/payment/success…` and `https://goclaim.space/api/webhook`.
- Create the QStash schedule (curl in `PHASE_5_COMPLETE.md`, with the real domain).

## 5. Verify on the live URL
`/` renders board · `/api/board` JSON · checkout 400s on bad input ·
`/listings/<slug>` + og tags · `/og-fallback.png` static card ·
`/api/presence` · snapshot via `?dev=1` is **blocked in production**
(signature path only) — trigger via QStash schedule, confirm
`/api/sponsor` updates · `/admin` login.

## 6. Windows operator notes (learned the hard way)
- `npx opennextjs-cloudflare ...` flakes after killing node processes (npm
  cache lock). Use the direct shim instead:
  `cmd /c "node_modules\.bin\opennextjs-cloudflare.cmd <build|preview>"`.
- Never chain build→preview in one command; stop preview before rebuilding
  (it locks `.open-next` → EPERM). Kill by PID matching `start-server.js`
  too, not just `next dev` — stale workers squat ports and serve old bundles.
  Always confirm the `Local:` line; never assume the port.
- `set VAR=val && ...` through Start-Process appends a **trailing space** to
  the value (proved via JSON echo). Use `set "VAR=val"` quoted form.
- Rapid-fire `Invoke-WebRequest` POSTs in one PowerShell session die at
  transport level against dev servers — single calls or 2s pauses.
- `wrangler tail goclaim-space` streams live logs for prod debugging.

## Rollback
`npx wrangler rollback goclaim-space` (or Deployments tab → promote a prior
version). DB migrations are additive and backwards-compatible by convention —
never gate a deploy on a destructive migration.
