"use client";
import { useState, useEffect } from "react";

export default function MilestoneStrip() {
  const [revenue, setRevenue] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.totals?.revenue === "number") setRevenue(d.totals.revenue);
      })
      .catch(() => {});
  }, []);

  if (revenue === null) return null;

  const next = Math.max(1000, Math.ceil((revenue + 1) / 1000) * 1000);
  const pct = Math.min(100, Math.round((revenue / next) * 100));

  return (
    <div className="mt-6 px-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>
          💰{" "}
          <span className="font-mono font-semibold text-foreground tabular-nums">
            ${revenue.toLocaleString()}
          </span>{" "}
          paid in bids since launch
        </span>
        <span className="tabular-nums">
          ${(next - revenue).toLocaleString()} to ${next.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}