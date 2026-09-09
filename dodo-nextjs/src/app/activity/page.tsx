import Link from "next/link";
import type { Metadata } from "next";
import { getRecentActivity } from "@/lib/data";
import { extractDisplayUrl } from "@/lib/normalize";

export const metadata: Metadata = {
  title: "Activity | goclaim.space",
  description: "Live activity on goclaim.space — bids, new listings, and #1 crowns.",
};

const KIND = {
  bid: { icon: "💸", verb: "bid" },
  join: { icon: "🚀", verb: "joined the board" },
  crown: { icon: "👑", verb: "crowned #1" },
} as const;

export default async function ActivityPage() {
  const items = await getRecentActivity(30);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Live activity
            </h1>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Every bid, every new listing, every crowning — as it happens.
            </p>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-neutral-500 py-16">
              Nothing yet. Be the first bid.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, i) => {
                const k = KIND[item.kind];
                return (
                  <div
                    key={`${item.kind}-${item.listing_id}-${item.at}-${i}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800"
                  >
                    <span className="text-lg shrink-0">{k.icon}</span>
                    <p className="flex-1 min-w-0 text-sm text-neutral-300 truncate">
                      <Link
                        href={`/listings/${item.slug || item.listing_id}`}
                        className="font-medium text-white hover:text-amber-300 transition-colors"
                      >
                        {item.product_name || item.listing_id}
                      </Link>{" "}
                      {k.verb}
                      {item.kind !== "join" && (
                        <span className="text-amber-300 font-medium tabular-nums">
                          {" "}
                          ${item.amount.toLocaleString()}
                        </span>
                      )}
                    </p>
                    <span className="text-[11px] text-neutral-600 shrink-0 tabular-nums">
                      {new Date(item.at).toLocaleDateString()}{" "}
                      {new Date(item.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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