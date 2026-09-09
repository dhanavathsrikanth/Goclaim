import { getAdminSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { getListings, getPayments, getBoardListings, getPresenceCount, getRecentActivity, getActiveSponsor, getCategoryStats } from "@/lib/data";
import { getComposioStatus } from "@/lib/composio";
import AdminSidebar from "./components/AdminSidebar";
import ComposioCard from "./components/ComposioCard";
import { ListingRowActions, CreativeActions, SnapshotTrigger } from "./components/AdminActions";
import CategoryIcon from "../components/CategoryIcon";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [listings, payments, allTime, today, composioStatus, viewers, activity, activeSponsor, catStats] = await Promise.all([
    getListings(),
    getPayments(),
    getBoardListings("all-time"),
    getBoardListings("today"),
    getComposioStatus(),
    getPresenceCount(),
    getRecentActivity(8),
    getActiveSponsor(),
    getCategoryStats(),
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const nextMilestone = Math.max(1000, Math.ceil((totalRevenue + 1) / 1000) * 1000);
  const milestonePct = Math.min(100, Math.round((totalRevenue / nextMilestone) * 100));

  const todayStr = new Date().toISOString().slice(0, 10);
  const latestSnapshot = activeSponsor?.snapshot_date ?? null;
  const cronStale = !latestSnapshot || latestSnapshot < todayStr;

  const failedPayments = payments.filter((p) => p.status === "failed");
  const stalePending = payments.filter(
    (p) =>
      p.status === "pending" &&
      Date.now() - new Date(p.created_at).getTime() > 24 * 60 * 60 * 1000
  );

  const confirmedCount = payments.filter((p) => p.status === "confirmed").length;
  const conversionPct =
    payments.length > 0 ? Math.round((confirmedCount / payments.length) * 100) : 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newWeek = listings.filter(
    (l) => new Date(l.created_at).getTime() >= weekAgo
  ).length;

  const creativeQueue = listings.filter((l) => l.banner_url || l.logo_url);

  const topAllTime = allTime[0];
  const topToday = today[0];

  return (
    <div className="min-h-screen bg-[#181716] text-[#F3F2EE] flex">
      {/* Sidebar Navigation */}
      <AdminSidebar adminEmail={session.user.email} />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        <div className="max-w-6xl w-full mx-auto p-6 sm:p-8 lg:p-10 space-y-10">
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#33322E] gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">System Overview</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#D97757]/15 text-[#D97757] border border-[#D97757]/30">
                  Live Console
                </span>
              </div>
              <p className="text-xs text-[#9E9C96] mt-1">
                Monitor real-time leaderboard bids, payment flows, and social proof automation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="px-3.5 py-2 text-xs font-semibold text-[#F3F2EE] hover:text-white bg-[#242320] hover:bg-[#282724] border border-[#33322E] rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <span>View Public Site</span>
                <span className="text-xs text-[#9E9C96]">↗</span>
              </Link>
            </div>
          </div>

          {/* Section: Overview Metrics */}
          <section id="overview" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Key Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                  Confirmed Revenue
                </p>
                <p className="text-2xl font-bold text-white mt-1.5">${totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Processed via Dodo Payments</p>
              </div>

              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                  Total Listings
                </p>
                <p className="text-2xl font-bold text-white mt-1.5">{listings.length}</p>
                <p className="text-[11px] text-[#9E9C96] mt-1">
                  {listings.filter((l) => l.status === "confirmed").length} confirmed on boards
                </p>
              </div>

              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                  All-Time #1 Leader
                </p>
                <p className="text-xl font-bold text-[#D97757] mt-1.5 truncate">
                  {topAllTime ? `${topAllTime.product_name} ($${topAllTime.total_bid})` : "None"}
                </p>
                <p className="text-[11px] text-[#9E9C96] mt-1 truncate">
                  {topAllTime ? topAllTime.url : "No bids recorded yet"}
                </p>
              </div>

              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                  Today's #1 (24h)
                </p>
                <p className="text-xl font-bold text-white mt-1.5 truncate">
                  {topToday ? `${topToday.product_name}` : "None"}
                </p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Leading the current rolling window</p>
              </div>
            </div>
          </section>

          {/* Section: Viral & Social */}
          <section id="viral" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Viral — Share Cards, Milestones, Live Presence
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                  Share card preview (#1)
                </p>
                {topAllTime ? (
                  <a href={`/listings/${topAllTime.slug || topAllTime.id}`} target="_blank">
                    <img
                      src="/og-fallback.png"
                      alt="Share card preview"
                      className="mt-3 w-full rounded-xl border border-[#33322E]"
                    />
                  </a>
                ) : (
                  <p className="text-xs text-[#9E9C96] mt-3">No listings yet.</p>
                )}
                <p className="text-[11px] text-[#9E9C96] mt-2">
                  Static share card (public/og-fallback.png) — attached to listing pages as og:image.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                    Revenue milestone
                  </p>
                  <p className="text-2xl font-bold text-white mt-1.5">
                    ${totalRevenue.toLocaleString()}{" "}
                    <span className="text-sm font-medium text-[#9E9C96]">
                      / ${nextMilestone.toLocaleString()}
                    </span>
                  </p>
                  <div className="h-2 rounded-full bg-[#282724] overflow-hidden mt-3">
                    <div
                      className="h-full rounded-full bg-[#D97757]"
                      style={{ width: `${milestonePct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#9E9C96] mt-1">
                    {(nextMilestone - totalRevenue).toLocaleString()} to go · {milestonePct}%
                  </p>
                </div>

                <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">
                    Viewing now
                  </p>
                  <p className="text-2xl font-bold text-white mt-1.5">
                    <span className="text-emerald-400">●</span> {viewers}
                  </p>
                  <p className="text-[11px] text-[#9E9C96] mt-1">
                    Distinct heartbeat clients active in the last 2 minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider mb-3">
                Latest activity (powers the public feed)
              </p>
              {activity.length === 0 ? (
                <p className="text-xs text-[#9E9C96]">No activity yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {activity.map((a, i) => (
                    <div
                      key={`${a.kind}-${a.listing_id}-${a.at}-${i}`}
                      className="flex items-center gap-2 text-xs text-[#9E9C96]"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-[#282724] border border-[#33322E] font-mono">
                        {a.kind}
                      </span>
                      <span className="truncate text-white">
                        {a.product_name || a.listing_id}
                      </span>
                      {a.kind !== "join" && (
                        <span className="font-bold text-[#D97757]">${a.amount}</span>
                      )}
                      <span className="ml-auto shrink-0 tabular-nums">
                        {new Date(a.at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section: Operations — cron backup (11.4) */}
          <section id="ops" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Operations — Cron Backup
            </h2>
            <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                {latestSnapshot ? (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      cronStale
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {cronStale ? `⚠️ Snapshot stale — last ${latestSnapshot}` : `✓ Snapshot healthy — ${latestSnapshot}`}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#282724] text-[#9E9C96] border border-[#33322E]">
                    No snapshots yet
                  </span>
                )}
                <SnapshotTrigger />
              </div>
              <p className="text-[11px] text-[#9E9C96] mt-2">
                QStash fires the snapshot daily at 00:00 UTC. Use the manual trigger if it ever fails.
              </p>
            </div>
          </section>

          {/* Section: Creative review queue (11.3 / 5.9) */}
          <section id="creatives" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Creative Review Queue ({creativeQueue.length})
            </h2>
            <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
              {creativeQueue.length === 0 ? (
                <p className="text-xs text-[#9E9C96]">No creatives submitted.</p>
              ) : (
                <div className="space-y-3">
                  {creativeQueue.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center gap-4 rounded-xl border border-[#33322E] bg-[#242320] p-3 flex-wrap"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {l.product_name || l.normalized_url}
                        </p>
                        <p className="text-[11px] text-[#9E9C96]">
                          {l.creative_approved ? "✅ approved" : "⏳ pending review"}
                        </p>
                      </div>
                      {l.banner_url && (
                        <img src={l.banner_url} alt="banner" className="h-10 rounded-lg border border-[#33322E] object-cover" />
                      )}
                      {l.logo_url && (
                        <img src={l.logo_url} alt="logo" className="h-10 w-10 rounded-lg border border-[#33322E] object-cover" />
                      )}
                      <CreativeActions id={l.id} />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-[#9E9C96] mt-2">
                Approved banners render on the winner&apos;s ad slot. Rejecting clears the URLs.
              </p>
            </div>
          </section>

          {/* Section: Monitoring (11.5) */}
          <section id="monitoring" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Monitoring
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">Failed payments</p>
                <p className={`text-2xl font-bold mt-1.5 ${failedPayments.length > 0 ? "text-red-400" : "text-white"}`}>
                  {failedPayments.length}
                </p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Needs attention when non-zero</p>
              </div>
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">Stale pending (&gt;24h)</p>
                <p className={`text-2xl font-bold mt-1.5 ${stalePending.length > 0 ? "text-amber-400" : "text-white"}`}>
                  {stalePending.length}
                </p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Checkouts never completed</p>
              </div>
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">Viewing now</p>
                <p className="text-2xl font-bold text-white mt-1.5">{viewers}</p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Heartbeat, last 2 min</p>
              </div>
            </div>
          </section>

          {/* Section: Analytics (11.6) */}
          <section id="analytics" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Analytics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">Payment conversion</p>
                <p className="text-2xl font-bold text-white mt-1.5">{conversionPct}%</p>
                <p className="text-[11px] text-[#9E9C96] mt-1">{confirmedCount} of {payments.length} payments confirmed</p>
              </div>
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">New listings (7d)</p>
                <p className="text-2xl font-bold text-white mt-1.5">{newWeek}</p>
                <p className="text-[11px] text-[#9E9C96] mt-1">Confirmed + pending</p>
              </div>
              <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-medium text-[#9E9C96] uppercase tracking-wider">Top categories</p>
                <div className="mt-2 space-y-1.5">
                  {catStats.slice(0, 3).map((c) => (
                    <div key={c.category} className="flex items-center gap-1.5 text-xs text-white">
                      <CategoryIcon category={c.category} className="size-3.5 text-[#D97757] shrink-0" />
                      <span className="truncate">{c.category}</span>
                      <span className="text-[#9E9C96] shrink-0 ml-auto">· {c.count} · ${c.totalBid.toLocaleString()}</span>
                    </div>
                  ))}
                  {catStats.length === 0 && (
                    <p className="text-xs text-[#9E9C96]">No data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Composio Social Proof */}
          <section id="social" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Composio Automation
            </h2>
            <ComposioCard
              initialConfigured={composioStatus.configured}
              initialApiKeyPresent={composioStatus.apiKeyPresent}
              initialTwitterConnected={composioStatus.twitterConnected}
            />
          </section>

          {/* Section: Listings Management Table */}
          <section id="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
                All Listings ({listings.length})
              </h2>
            </div>
            <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F3F2EE]">
                  <thead className="bg-[#242320] uppercase text-[10px] text-[#9E9C96] tracking-wider border-b border-[#33322E]">
                    <tr>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Total Bid</th>
                      <th className="px-6 py-3.5">Clicks</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Claim Email</th>
                      <th className="px-6 py-3.5">Public Slug</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#33322E]">
                    {listings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-[#9E9C96]">
                          No listings registered in database.
                        </td>
                      </tr>
                    ) : (
                      listings.map((l) => (
                        <tr key={l.id} className="hover:bg-[#242320]/60 transition-colors">
                          <td className="px-6 py-3.5 font-medium text-white">
                            <div className="flex items-center gap-2.5">
                              {l.favicon_url ? (
                                <img src={l.favicon_url} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                              ) : (
                                <CategoryIcon category={l.category} className="w-4 h-4 text-[#D97757] shrink-0" />
                              )}
                              <span className="truncate max-w-[180px]">{l.product_name || l.normalized_url}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-[#9E9C96]">
                            <span className="inline-flex items-center gap-1.5">
                              <CategoryIcon category={l.category} className="w-3.5 h-3.5 text-[#D97757] shrink-0" />
                              <span>{l.category}</span>
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-[#D97757]">${l.total_bid}</td>
                          <td className="px-6 py-3.5">{l.click_count}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                l.status === "confirmed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[#9E9C96]">{l.claim_email || "—"}</td>
                          <td className="px-6 py-3.5 text-[#D97757]">
                            {l.slug ? (
                              <Link href={`/listings/${l.slug}`} target="_blank" className="hover:underline">
                                /{l.slug}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <ListingRowActions id={l.id} status={l.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section: Payments Table */}
          <section id="payments" className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E9C96]">
              Recent Transactions ({payments.length})
            </h2>
            <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F3F2EE]">
                  <thead className="bg-[#242320] uppercase text-[10px] text-[#9E9C96] tracking-wider border-b border-[#33322E]">
                    <tr>
                      <th className="px-6 py-3.5">Payment ID</th>
                      <th className="px-6 py-3.5">Listing ID</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#33322E]">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-[#9E9C96]">
                          No transaction records found.
                        </td>
                      </tr>
                    ) : (
                      payments.slice(0, 20).map((p) => (
                        <tr key={p.id} className="hover:bg-[#242320]/60 transition-colors">
                          <td className="px-6 py-3.5 font-mono text-[#9E9C96]">{p.id}</td>
                          <td className="px-6 py-3.5 font-mono text-[#9E9C96]">{p.listing_id}</td>
                          <td className="px-6 py-3.5 font-bold text-white">${p.amount}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.status === "confirmed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-[#282724] text-[#9E9C96] border border-[#33322E]"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[#9E9C96]">
                            {new Date(p.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
