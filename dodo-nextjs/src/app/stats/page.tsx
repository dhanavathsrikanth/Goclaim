import Link from "next/link";
import type { Metadata } from "next";
import { getPublicStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Stats | goclaim.space",
  description:
    "Live goclaim.space counters — total paid in bids, listings, clicks, and the highest bid.",
};

export default async function StatsPage() {
  const stats = await getPublicStats();

  const tiles = [
    { label: "Paid in bids", value: `$${stats.revenue.toLocaleString()}` },
    { label: "Live listings", value: stats.listings.toLocaleString() },
    { label: "Outbound clicks", value: stats.clicks.toLocaleString() },
    { label: "Highest bid", value: `$${stats.top_bid.toLocaleString()}` },
    { label: "Active categories", value: stats.categories.toLocaleString() },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Stats
            </h1>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Live counters, straight from the database. No vanity metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tiles.map((t) => (
              <div
                key={t.label}
                className="rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-5 text-center"
              >
                <p className="text-2xl font-bold text-white tabular-nums break-all">
                  {t.value}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{t.label}</p>
              </div>
            ))}
            <Link
              href="/"
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-5 text-center hover:bg-amber-500/20 transition-colors flex flex-col items-center justify-center"
            >
              <p className="text-2xl font-bold text-amber-300">Bid →</p>
              <p className="text-xs text-neutral-400 mt-1">
                Move these numbers
              </p>
            </Link>
          </div>

          <p className="text-center text-xs text-neutral-600 mt-8">
            Revenue counts confirmed payments only. Clicks are tracked
            outbound visits through the board.
          </p>
        </div>
      </div>
    </div>
  );
}