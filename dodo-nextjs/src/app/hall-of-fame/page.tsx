import Link from "next/link";
import type { Metadata } from "next";
import { getHallOfFame } from "@/lib/data";
import { extractDisplayUrl } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Hall of Fame | goclaim.space",
  description:
    "Every past #1 winner on goclaim.space — the bids that owned the sponsor slot, immortalized.",
};

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

const FILTERS = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
] as const;

function cutoffFor(filter: string): string | null {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - offset
      )
    );
    return d.toISOString().slice(0, 10);
  };
  if (filter === "week") return day(6);
  if (filter === "month") return day(29);
  return null;
}

export default async function HallOfFame({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams;
  const filter =
    rawFilter === "week" || rawFilter === "month" ? rawFilter : "all";

  const all = await getHallOfFame();
  const cutoff = cutoffFor(filter);
  const entries = cutoff
    ? all.filter((e) => e.snapshot_date >= cutoff)
    : all;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
              🏆 Hall of Fame
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every bid that owned #1 at the midnight cutoff — and the sponsor
              slot that came with it. Immortalized, win or lose.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {FILTERS.map((f) => (
              <Link
                key={f.id}
                href={`/hall-of-fame${f.id === "all" ? "" : `?filter=${f.id}`}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-2">No winners yet</p>
              <p className="text-muted-foreground/70 text-sm">
                {all.length === 0
                  ? "The first daily snapshot crowns a champion at midnight UTC."
                  : "No winners in this window — try a wider filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => {
                const logo = e.logo_url || e.favicon_url;
                return (
                  <div
                    key={e.snapshot_date}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl bg-card border border-amber-500/20"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt=""
                        className="w-10 h-10 rounded-lg shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0">
                        {e.product_name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/listings/${e.slug || e.listing_id}`}
                        className="text-base font-semibold text-foreground hover:text-amber-600 transition-colors truncate block"
                      >
                        {e.product_name || extractDisplayUrl(e.url)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        👑 {e.snapshot_date} ·{" "}
                        {e.clicks_during_slot.toLocaleString()} clicks during
                        slot
                      </p>
                    </div>
                    <span className="text-lg font-bold text-amber-300 tabular-nums shrink-0">
                      ${e.total_bid.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}