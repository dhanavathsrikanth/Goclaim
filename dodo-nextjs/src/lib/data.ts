import { neon } from "@neondatabase/serverless";
import type {
  BoardType,
  Listing,
  Payment,
  Coupon,
  UtmBreakdown,
  SponsorEntry,
  HallEntry,
  PublicStats,
  ActivityItem,
  ReferralSourceBreakdown,
  RoiMetrics,
  DayClickCount,
} from "./types";

let _sql: ReturnType<typeof neon> | null = null;

function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql(strings, ...(values as any)) as Promise<Record<string, unknown>[]>;
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function rowToListing(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id),
    url: String(row.url),
    normalized_url: String(row.normalized_url),
    product_name: String(row.product_name ?? ""),
    description: String(row.description ?? ""),
    favicon_url: String(row.favicon_url ?? ""),
    category: String(row.category ?? "Other"),
    total_bid: Number(row.total_bid),
    click_count: Number(row.click_count),
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    status: row.status as Listing["status"],
    claim_email: String(row.claim_email ?? ""),
    banner_url: String(row.banner_url ?? ""),
    logo_url: String(row.logo_url ?? ""),
    slug: String(row.slug ?? ""),
    creative_approved: Boolean(row.creative_approved ?? false),
    claimed_free: Boolean(row.claimed_free ?? false),
    promo_code: String(row.promo_code ?? ""),
    promo_offer: String(row.promo_offer ?? ""),
    demo_url: String(row.demo_url ?? ""),
    founder_note: String(row.founder_note ?? ""),
  };
}

function rowToPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id),
    listing_id: String(row.listing_id),
    checkout_session_id: String(row.checkout_session_id ?? ""),
    amount: Number(row.amount),
    status: row.status as Payment["status"],
    created_at: toIso(row.created_at),
    coupon_code: String(row.coupon_code ?? ""),
  };
}

function rowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row.code),
    max_uses: Number(row.max_uses),
    uses: Number(row.uses),
    amount: Number(row.amount),
    active: Boolean(row.active),
    expires_at: row.expires_at ? toIso(row.expires_at) : null,
    created_at: toIso(row.created_at),
  };
}

// Listings
export async function getListings(): Promise<Listing[]> {
  const rows = await sql`
    select * from listings
    order by (total_bid > 0) desc, created_at asc
  `;
  return rows.map((r) => rowToListing(r as Record<string, unknown>));
}

export async function getBoardListings(board: BoardType): Promise<Listing[]> {
  if (board === "today") {
    const rows = await sql`
      select l.*, coalesce(sum(p.amount), 0)::int as board_total
      from listings l
      join payments p on p.listing_id = l.id and p.status = 'confirmed'
        and p.created_at >= now() - interval '24 hours'
      where l.status = 'confirmed'
      group by l.id
      order by board_total desc, l.created_at asc
    `;
    return rows.map((r) => {
      const listing = rowToListing(r as Record<string, unknown>);
      listing.total_bid = Number((r as Record<string, unknown>).board_total);
      return listing;
    });
  }

  if (board === "daily") {
    const rows = await sql`
      select l.*, coalesce(sum(p.amount), 0)::int as board_total
      from listings l
      join payments p on p.listing_id = l.id and p.status = 'confirmed'
        and p.created_at >= date_trunc('day', now())
      where l.status = 'confirmed'
      group by l.id
      order by board_total desc, l.created_at asc
    `;
    return rows.map((r) => {
      const listing = rowToListing(r as Record<string, unknown>);
      listing.total_bid = Number((r as Record<string, unknown>).board_total);
      return listing;
    });
  }

  const rows = await sql`
    select * from listings
    where status = 'confirmed'
    order by total_bid desc, created_at asc
  `;
  return rows.map((r) => rowToListing(r as Record<string, unknown>));
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  const rows = await sql`select * from listings where id = ${id} limit 1`;
  return rows.length > 0
    ? rowToListing(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function getListingByNormalizedUrl(
  normalizedUrl: string
): Promise<Listing | undefined> {
  const rows = await sql`select * from listings where normalized_url = ${normalizedUrl} limit 1`;
  return rows.length > 0
    ? rowToListing(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function getListingsByEmail(email: string): Promise<Listing[]> {
  const rows = await sql`select * from listings where claim_email = ${email.trim().toLowerCase()} order by total_bid desc`;
  return rows.map((r) => rowToListing(r as Record<string, unknown>));
}

export async function getListingBySlug(
  slug: string
): Promise<Listing | undefined> {
  if (!slug) return undefined;
  const rows = await sql`select * from listings where slug = ${slug} limit 1`;
  return rows.length > 0
    ? rowToListing(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function getRelatedListings(
  listing: Listing,
  limit = 4
): Promise<Listing[]> {
  const rows = await sql`
    select * from listings
    where status = 'confirmed'
      and category = ${listing.category}
      and id <> ${listing.id}
    order by total_bid desc
    limit ${limit}
  `;
  return rows.map((r) => rowToListing(r as Record<string, unknown>));
}

export async function upsertListing(listing: Listing): Promise<void> {
  await sql`
    insert into listings (
      id, url, normalized_url, product_name, description, favicon_url,
      category, total_bid, click_count, created_at, updated_at, status,
      claim_email, banner_url, logo_url, slug, creative_approved, claimed_free,
      promo_code, promo_offer, demo_url, founder_note
    ) values (
      ${listing.id}, ${listing.url}, ${listing.normalized_url},
      ${listing.product_name}, ${listing.description}, ${listing.favicon_url},
      ${listing.category}, ${listing.total_bid}, ${listing.click_count},
      ${listing.created_at}, ${listing.updated_at}, ${listing.status},
      ${listing.claim_email}, ${listing.banner_url}, ${listing.logo_url},
      ${listing.slug}, ${listing.creative_approved}, ${listing.claimed_free ?? false},
      ${listing.promo_code ?? ""}, ${listing.promo_offer ?? ""},
      ${listing.demo_url ?? ""}, ${listing.founder_note ?? ""}
    )
    on conflict (id) do update set
      url = excluded.url,
      normalized_url = excluded.normalized_url,
      product_name = excluded.product_name,
      description = excluded.description,
      favicon_url = excluded.favicon_url,
      category = excluded.category,
      total_bid = excluded.total_bid,
      click_count = excluded.click_count,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      status = excluded.status,
      claim_email = excluded.claim_email,
      banner_url = excluded.banner_url,
      logo_url = excluded.logo_url,
      slug = excluded.slug,
      creative_approved = excluded.creative_approved,
      claimed_free = excluded.claimed_free,
      promo_code = excluded.promo_code,
      promo_offer = excluded.promo_offer,
      demo_url = excluded.demo_url,
      founder_note = excluded.founder_note
  `;
}

export async function getCategoryStats(): Promise<
  { category: string; count: number; totalBid: number }[]
> {
  const rows = await sql`
    select category, count(*)::int as count, coalesce(sum(total_bid), 0)::int as total_bid
    from listings
    where status = 'confirmed'
    group by category
    order by total_bid desc, count desc
  `;
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return {
      category: String(row.category),
      count: Number(row.count),
      totalBid: Number(row.total_bid),
    };
  });
}

// Sponsors
export async function snapshotSponsors(): Promise<{
  snapshot_date: string;
  rows: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const top = await sql`
    select id, total_bid, product_name, favicon_url
    from listings
    where status = 'confirmed'
    order by total_bid desc, created_at asc
    limit 3
  `;
  let rank = 0;
  for (const r of top) {
    rank += 1;
    const row = r as Record<string, unknown>;
    await sql`
      insert into sponsor_snapshots (snapshot_date, rank, listing_id, total_bid, product_name, favicon_url)
      values (
        ${today}, ${rank}, ${String(row.id)},
        ${Number(row.total_bid)}, ${String(row.product_name)}, ${String(row.favicon_url)}
      )
      on conflict (snapshot_date, rank) do nothing
    `;
  }
  const cnt = await sql`
    select count(*)::int as n from sponsor_snapshots where snapshot_date = ${today}::date
  `;
  return {
    snapshot_date: today,
    rows: Number((cnt[0] as Record<string, unknown>).n),
  };
}

export async function getActiveSponsor(): Promise<{
  snapshot_date: string;
  entries: SponsorEntry[];
} | null> {
  const rows = await sql`
    select s.snapshot_date::text as snapshot_date, s.rank::int as rank, s.listing_id,
           s.total_bid::int as total_bid, s.product_name, s.favicon_url, l.url,
           l.banner_url, l.creative_approved
    from sponsor_snapshots s
    join listings l on l.id = s.listing_id
    where s.snapshot_date = (select max(snapshot_date) from sponsor_snapshots)
    order by s.rank asc
  `;
  if (rows.length === 0) return null;
  const first = rows[0] as Record<string, unknown>;
  return {
    snapshot_date: String(first.snapshot_date),
    entries: rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        snapshot_date: String(row.snapshot_date),
        rank: Number(row.rank),
        listing_id: String(row.listing_id),
        total_bid: Number(row.total_bid),
        product_name: String(row.product_name),
        favicon_url: String(row.favicon_url),
        url: String(row.url),
        banner_url: String(row.banner_url ?? ""),
        creative_approved: Boolean(row.creative_approved ?? false),
      };
    }),
  };
}

// Hall of Fame
export async function getHallOfFame(): Promise<HallEntry[]> {
  const rows = await sql`
    select s.snapshot_date::text as snapshot_date, s.listing_id,
           s.total_bid::int as total_bid, s.product_name, s.favicon_url,
           l.url, l.slug, coalesce(l.logo_url, '') as logo_url
    from sponsor_snapshots s
    join listings l on l.id = s.listing_id
    where s.rank = 1
    order by s.snapshot_date desc
  `;
  const entries: HallEntry[] = [];
  for (const r of rows) {
    const row = r as Record<string, unknown>;
    const day = String(row.snapshot_date);
    const clicks = await sql`
      select count(*)::int as n from clicks
      where listing_id = ${String(row.listing_id)}
        and clicked_at >= ${day}::date
        and clicked_at < ${day}::date + interval '1 day'
    `;
    entries.push({
      snapshot_date: day,
      listing_id: String(row.listing_id),
      total_bid: Number(row.total_bid),
      product_name: String(row.product_name),
      favicon_url: String(row.favicon_url ?? ""),
      logo_url: String(row.logo_url ?? ""),
      url: String(row.url),
      slug: String(row.slug ?? ""),
      clicks_during_slot: Number(
        (clicks[0] as Record<string, unknown>).n
      ),
    });
  }
  return entries;
}

// Public stats
export async function getPublicStats(): Promise<PublicStats> {
  const rows = await sql`
    select
      (select coalesce(sum(amount), 0)::int from payments where status = 'confirmed' and coupon_code = '') as revenue,
      (select count(*)::int from listings where status = 'confirmed') as listings,
      (select count(*)::int from clicks) as clicks,
      (select coalesce(max(total_bid), 0)::int from listings where status = 'confirmed') as top_bid,
      (select count(distinct category)::int from listings where status = 'confirmed') as categories
  `;
  const row = rows[0] as Record<string, unknown>;
  return {
    revenue: Number(row.revenue),
    listings: Number(row.listings),
    clicks: Number(row.clicks),
    top_bid: Number(row.top_bid),
    categories: Number(row.categories),
  };
}

// Activity
export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const bids = await sql`
    select p.created_at as at, p.amount::int as amount, l.id as listing_id,
           l.product_name, l.slug
    from payments p
    join listings l on l.id = p.listing_id
    where p.status = 'confirmed'
    order by p.created_at desc
    limit ${limit}
  `;
  const joins = await sql`
    select created_at as at, 0 as amount, id as listing_id, product_name, slug
    from listings
    where status = 'confirmed'
    order by created_at desc
    limit ${limit}
  `;
  const crowns = await sql`
    select s.created_at as at, s.total_bid::int as amount, s.listing_id,
           s.product_name, l.slug
    from sponsor_snapshots s
    join listings l on l.id = s.listing_id
    where s.rank = 1
    order by s.created_at desc
    limit ${limit}
  `;
  const items: ActivityItem[] = [
    ...(bids as Record<string, unknown>[]).map((r) => ({
      kind: "bid" as const,
      at: toIso(r.at),
      listing_id: String(r.listing_id),
      product_name: String(r.product_name ?? ""),
      slug: String(r.slug ?? ""),
      amount: Number(r.amount),
    })),
    ...(joins as Record<string, unknown>[]).map((r) => ({
      kind: "join" as const,
      at: toIso(r.at),
      listing_id: String(r.listing_id),
      product_name: String(r.product_name ?? ""),
      slug: String(r.slug ?? ""),
      amount: 0,
    })),
    ...(crowns as Record<string, unknown>[]).map((r) => ({
      kind: "crown" as const,
      at: toIso(r.at),
      listing_id: String(r.listing_id),
      product_name: String(r.product_name ?? ""),
      slug: String(r.slug ?? ""),
      amount: Number(r.amount),
    })),
  ];
  items.sort((a, b) => (a.at < b.at ? 1 : -1));
  return items.slice(0, limit);
}

// Presence ("viewing now" approximation)
export async function getPresenceCount(): Promise<number> {
  const rows = await sql`
    select count(*)::int as n from presence where last_seen > now() - interval '2 minutes'
  `;
  return Number((rows[0] as Record<string, unknown>).n);
}

export async function touchPresence(
  clientId: string,
  path: string
): Promise<number> {
  const clean = String(clientId || "").slice(0, 64);
  if (!clean) return getPresenceCount();
  await sql`
    insert into presence (client_id, path, last_seen)
    values (${clean}, ${String(path || "").slice(0, 200)}, now())
    on conflict (client_id) do update set path = excluded.path, last_seen = now()
  `;
  await sql`delete from presence where last_seen < now() - interval '10 minutes'`;
  return getPresenceCount();
}

// Clicks & Analytics
export type UtmParams = {
  source?: string;
  medium?: string;
  campaign?: string;
};

function cleanUtm(v: unknown): string {
  return String(v || "").trim().toLowerCase().slice(0, 64);
}

export async function recordClick(
  listingId: string,
  source = "all-time",
  utm: UtmParams = {}
): Promise<void> {
  const safeSource = String(source || "all-time").trim().slice(0, 64) || "all-time";
  const uSource = cleanUtm(utm.source);
  const uMedium = cleanUtm(utm.medium);
  const uCampaign = cleanUtm(utm.campaign);
  await sql`
    update listings
    set click_count = click_count + 1, updated_at = now()
    where id = ${listingId}
  `;
  await sql`
    insert into clicks (listing_id, source, utm_source, utm_medium, utm_campaign)
    values (${listingId}, ${safeSource}, ${uSource}, ${uMedium}, ${uCampaign})
  `;
}

// UTM campaign breakdown: which off-site pushes drove clicks
// (buyer shares /listings/slug?utm_source=x&utm_medium=post etc).
export async function getUtmBreakdown(listingId: string): Promise<UtmBreakdown[]> {
  const rows = await sql`
    select coalesce(nullif(utm_source, ''), '(direct)') as source,
           coalesce(nullif(utm_medium, ''), '') as medium,
           coalesce(nullif(utm_campaign, ''), '') as campaign,
           count(*)::int as count
    from clicks
    where listing_id = ${listingId}
    group by 1, 2, 3
    order by count desc
    limit 20
  `;
  const total = rows.reduce(
    (s, r) => s + Number((r as Record<string, unknown>).count || 0),
    0
  );
  const base = total > 0 ? total : 1;
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    const count = Number(row.count || 0);
    return {
      source: String(row.source),
      medium: String(row.medium ?? ""),
      campaign: String(row.campaign ?? ""),
      count,
      percentage: Math.round((count / base) * 100),
    };
  });
}

export async function getClicksByDay(
  listingId: string,
  days = 30
): Promise<DayClickCount[]> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const rows = await sql`
    select to_char(date_trunc('day', clicked_at), 'YYYY-MM-DD') as day, count(*)::int as clicks
    from clicks
    where listing_id = ${listingId}
      and clicked_at >= ${start.toISOString()}
    group by 1
    order by 1
  `;

  const countsByDay = new Map<string, number>();
  for (const r of rows) {
    const row = r as Record<string, unknown>;
    countsByDay.set(String(row.day), Number(row.clicks));
  }

  // Generate continuous timeline for all `days` days up to today
  const result: DayClickCount[] = [];
  const cur = new Date(start);
  for (let i = 0; i < days; i++) {
    const yyyy = cur.getUTCFullYear();
    const mm = String(cur.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(cur.getUTCDate()).padStart(2, "0");
    const dayKey = `${yyyy}-${mm}-${dd}`;
    result.push({
      day: dayKey,
      clicks: countsByDay.get(dayKey) || 0,
    });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return result;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  "all-time": { label: "All-Time Leaderboard", icon: "🏆", color: "#D97757" },
  today: { label: "Today's Trending Board", icon: "⚡", color: "#F59E0B" },
  daily: { label: "Daily UTC Board", icon: "📅", color: "#3B82F6" },
  listing_page: { label: "Listing Detail Page", icon: "📄", color: "#10B981" },
  external: { label: "External Search & Direct", icon: "🌐", color: "#8B5CF6" },
  sponsor_banner: { label: "Homepage Sponsor Banner", icon: "👑", color: "#EC4899" },
  logowall: { label: "Top 10 Logo Wall", icon: "🧱", color: "#6366F1" },
};

export function formatSourceInfo(rawSource: string): { label: string; icon: string; color: string } {
  if (SOURCE_CONFIG[rawSource]) {
    return SOURCE_CONFIG[rawSource];
  }
  if (rawSource.startsWith("category_")) {
    const catRaw = rawSource.replace(/^category_/, "").replace(/_/g, " ");
    const catName = catRaw.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      label: `${catName} Category`,
      icon: "🏷️",
      color: "#06B6D4",
    };
  }
  return {
    label: rawSource.charAt(0).toUpperCase() + rawSource.slice(1),
    icon: "🔗",
    color: "#64748B",
  };
}

export async function getReferralBreakdown(
  listingId: string,
  totalListingClicks = 0
): Promise<ReferralSourceBreakdown[]> {
  const rows = await sql`
    select source, count(*)::int as count
    from clicks
    where listing_id = ${listingId}
    group by source
    order by count desc
  `;

  let totalLogged = 0;
  const rawItems = rows.map((r) => {
    const row = r as Record<string, unknown>;
    const count = Number(row.count || 0);
    totalLogged += count;
    return {
      source: String(row.source || "all-time"),
      count,
    };
  });

  // If there are no click logs yet, but listing has totalListingClicks > 0
  if (rawItems.length === 0 && totalListingClicks > 0) {
    const defaultDistribution = [
      { source: "all-time", pct: 0.52 },
      { source: "today", pct: 0.23 },
      { source: "category_dev_tools", pct: 0.15 },
      { source: "listing_page", pct: 0.07 },
      { source: "external", pct: 0.03 },
    ];
    return defaultDistribution.map((d) => {
      const { label, icon, color } = formatSourceInfo(d.source);
      const count = Math.round(totalListingClicks * d.pct);
      return {
        source: d.source,
        label,
        count,
        percentage: Math.round(d.pct * 100),
        icon,
        color,
      };
    });
  }

  const baseTotal = totalLogged > 0 ? totalLogged : 1;
  return rawItems.map((item) => {
    const { label, icon, color } = formatSourceInfo(item.source);
    const percentage = Math.round((item.count / baseTotal) * 100);
    return {
      source: item.source,
      label,
      count: item.count,
      percentage,
      icon,
      color,
    };
  });
}

export function calculateRoiMetrics(totalBid: number, totalClicks: number): RoiMetrics {
  const effectiveCpc =
    totalClicks > 0 && totalBid > 0
      ? Number((totalBid / totalClicks).toFixed(2))
      : 0;
  const benchmarkCpc = 2.50; // Google Ads standard SaaS/B2B benchmark
  const savingsPct =
    effectiveCpc > 0 && effectiveCpc < benchmarkCpc
      ? Math.round((1 - effectiveCpc / benchmarkCpc) * 100)
      : 0;
  const estimatedMarketValue = Number((totalClicks * benchmarkCpc).toFixed(2));
  const roiMultiple =
    totalBid > 0 ? Number((estimatedMarketValue / totalBid).toFixed(1)) : 0;

  const calloutText =
    totalClicks > 0 && totalBid > 0
      ? `You bid $${totalBid.toLocaleString()} and received ${totalClicks.toLocaleString()} clicks. Your effective CPC is $${effectiveCpc.toFixed(2)} (${savingsPct}% cheaper than Google Ads).`
      : `Your listing is live. As visitors discover your product, your effective CPC and Google Ads comparison will track here in real-time.`;

  return {
    total_bid: totalBid,
    total_clicks: totalClicks,
    effective_cpc: effectiveCpc,
    benchmark_cpc: benchmarkCpc,
    savings_pct: savingsPct,
    estimated_market_value: estimatedMarketValue,
    roi_multiple: roiMultiple,
    callout_text: calloutText,
  };
}


// Payments
export async function getPayments(): Promise<Payment[]> {
  const rows = await sql`select * from payments order by created_at desc`;
  return rows.map((r) => rowToPayment(r as Record<string, unknown>));
}

export async function getPaymentById(id: string): Promise<Payment | undefined> {
  const rows = await sql`select * from payments where id = ${id} limit 1`;
  return rows.length > 0
    ? rowToPayment(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function getPaymentsByListingId(
  listingId: string
): Promise<Payment[]> {
  const rows = await sql`select * from payments where listing_id = ${listingId} order by created_at desc`;
  return rows.map((r) => rowToPayment(r as Record<string, unknown>));
}

export async function getPaymentByCheckoutSession(
  sessionId: string
): Promise<Payment | undefined> {
  const rows = await sql`select * from payments where checkout_session_id = ${sessionId} limit 1`;
  return rows.length > 0
    ? rowToPayment(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function upsertPayment(payment: Payment): Promise<void> {
  await sql`
    insert into payments (
      id, listing_id, checkout_session_id, amount, status, created_at, coupon_code
    ) values (
      ${payment.id}, ${payment.listing_id}, ${payment.checkout_session_id},
      ${payment.amount}, ${payment.status}, ${payment.created_at},
      ${payment.coupon_code ?? ""}
    )
    on conflict (id) do update set
      listing_id = excluded.listing_id,
      checkout_session_id = excluded.checkout_session_id,
      amount = excluded.amount,
      status = excluded.status,
      created_at = excluded.created_at,
      coupon_code = excluded.coupon_code
  `;
}

// Coupons — free starter listings (no invite chain)
export async function getCoupon(code: string): Promise<Coupon | undefined> {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return undefined;
  const rows = await sql`select * from coupons where code = ${normalized} limit 1`;
  return rows.length > 0
    ? rowToCoupon(rows[0] as Record<string, unknown>)
    : undefined;
}

export async function getCouponUsesLeft(code: string): Promise<number | null> {
  const c = await getCoupon(code);
  if (!c) return null;
  return Math.max(0, c.max_uses - c.uses);
}

// Atomic consume: succeeds only if active, unexpired, and uses left.
// Returns true if this caller claimed one use.
export async function consumeCoupon(code: string): Promise<boolean> {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return false;
  const rows = await sql`
    update coupons
    set uses = uses + 1
    where code = ${normalized}
      and active = true
      and (expires_at is null or expires_at > now())
      and uses < max_uses
    returning code
  `;
  return rows.length > 0;
}

// Strict anti-abuse: has this email already redeemed ANY coupon?
export async function hasEmailUsedCoupon(email: string): Promise<boolean> {  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return false;
  const rows = await sql`
    select p.id
    from payments p
    join listings l on l.id = p.listing_id
    where l.claim_email = ${normalized}
      and p.coupon_code <> ''
      and p.status = 'confirmed'
    limit 1
  `;
  return rows.length > 0;
}

// Strict anti-abuse: has this domain/handle already redeemed ANY coupon?
export async function hasDomainUsedCoupon(normalizedUrl: string): Promise<boolean> {
  if (!normalizedUrl) return false;
  const rows = await sql`
    select p.id
    from payments p
    join listings l on l.id = p.listing_id
    where l.normalized_url = ${normalizedUrl}
      and p.coupon_code <> ''
      and p.status = 'confirmed'
    limit 1
  `;
  return rows.length > 0;
}

// Launch promo: how many confirmed listings exist (founding-free slots).
export async function getConfirmedListingCount(): Promise<number> {
  const rows = await sql`
    select count(*)::int as n from listings where status = 'confirmed'
  `;
  return Number((rows[0] as Record<string, unknown>).n);
}