"use client";

import type { ReferralSourceBreakdown } from "@/lib/types";

type Props = {
  breakdown: ReferralSourceBreakdown[];
  totalClicks: number;
};

export default function ReferralBreakdownCard({ breakdown, totalClicks }: Props) {
  const sources = breakdown && breakdown.length > 0 ? breakdown : [];

  return (
    <div className="rounded-xl bg-card border border-border p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-sm">
              🧭
            </span>
            <h4 className="text-sm font-bold text-foreground">
              Referral Source Breakdown
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Where your clicks came from across boards, category filters, and direct pages.
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground">
          {totalClicks.toLocaleString()} Total Tracked Clicks
        </span>
      </div>

      {/* Visual Stacked Progress Bar */}
      {sources.length > 0 && (
        <div className="mt-4">
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-muted/60 p-0.5 gap-0.5">
            {sources.map((s) => (
              <div
                key={s.source}
                title={`${s.label}: ${s.count} clicks (${s.percentage}%)`}
                style={{
                  width: `${Math.max(2, s.percentage)}%`,
                  backgroundColor: s.color || "#D97757",
                }}
                className="h-full rounded-sm transition-all hover:opacity-90 cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}

      {/* Sources Table / List */}
      <div className="mt-4 divide-y divide-border/40">
        {sources.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3 text-center">
            No referral data logged yet.
          </p>
        ) : (
          sources.map((s) => (
            <div
              key={s.source}
              className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/20 px-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm shrink-0">{s.icon || "🔗"}</span>
                <div className="min-w-0">
                  <span className="font-semibold text-foreground truncate block">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    source={s.source}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Visual Mini Progress */}
                <div className="hidden sm:block w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.percentage}%`,
                      backgroundColor: s.color || "#D97757",
                    }}
                  />
                </div>

                <div className="text-right min-w-16">
                  <span className="font-bold text-foreground tabular-nums">
                    {s.count.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    ({s.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Explanatory Footer */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Includes All-time, Today, Category, and Listing page redirects.</span>
        <span className="font-medium text-primary">Live Real-Time Attribution</span>
      </div>
    </div>
  );
}
