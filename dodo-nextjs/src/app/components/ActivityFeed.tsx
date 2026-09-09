"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { ActivityItem } from "@/lib/types";

const ICONS = { bid: "💸", join: "🚀", crown: "👑" } as const;

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((d) => setItems((d.items || []).slice(0, 6)))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-[-0.02em]">
          Live activity
        </h2>
        <Link
          href="/activity"
          className="text-xs font-medium text-primary hover:text-primary/80"
        >
          View all &gt;
        </Link>
      </div>
      <ol className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card px-3">
        {items.map((item, i) => (
          <li
            key={`${item.kind}-${item.listing_id}-${item.at}-${i}`}
            className="flex items-center gap-2 py-2 text-xs"
          >
            <span className="shrink-0">{ICONS[item.kind]}</span>
            <p className="min-w-0 flex-1 truncate text-muted-foreground">
              <Link
                href={`/listings/${item.slug || item.listing_id}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.product_name || item.listing_id}
              </Link>{" "}
              {item.kind === "bid" && (
                <>bid ${item.amount.toLocaleString()}</>
              )}
              {item.kind === "join" && "joined the board"}
              {item.kind === "crown" && (
                <>crowned #1 at ${item.amount.toLocaleString()}</>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}