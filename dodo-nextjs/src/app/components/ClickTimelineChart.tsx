"use client";

import { useState } from "react";
import type { DayClickCount } from "@/lib/types";

type Props = {
  data: DayClickCount[];
};

function formatDate(isoDay: string): string {
  try {
    const parts = isoDay.split("-");
    if (parts.length === 3) {
      const d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    }
    return isoDay;
  } catch {
    return isoDay;
  }
}

export default function ClickTimelineChart({ data }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Ensure 30 items
  const days30 = data.slice(-30);
  const totalClicks = days30.reduce((s, d) => s + d.clicks, 0);
  const maxClicks = Math.max(1, ...days30.map((d) => d.clicks));
  const avgClicks = days30.length > 0 ? (totalClicks / days30.length).toFixed(1) : "0.0";

  // Find peak day
  let peakDay = days30[0];
  for (const d of days30) {
    if (!peakDay || d.clicks > peakDay.clicks) {
      peakDay = d;
    }
  }

  const activeItem = hoveredIndex !== null && days30[hoveredIndex] ? days30[hoveredIndex] : null;

  return (
    <div className="rounded-xl bg-card border border-border p-4 sm:p-5 shadow-xs">
      {/* Header & Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary text-sm">
              📊
            </span>
            <h4 className="text-sm font-bold text-foreground">
              30-Day Click Trends &amp; Traffic Spikes
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Daily breakdown of verified visitor traffic over the last 30 days.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              30-Day Total
            </span>
            <span className="font-bold text-foreground tabular-nums text-sm">
              {totalClicks.toLocaleString()} clicks
            </span>
          </div>

          <div className="h-6 w-px bg-border/60" />

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Daily Avg
            </span>
            <span className="font-bold text-foreground tabular-nums text-sm">
              {avgClicks} / day
            </span>
          </div>

          {peakDay && peakDay.clicks > 0 && (
            <>
              <div className="h-6 w-px bg-border/60" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-primary block">
                  🔥 Peak Spike
                </span>
                <span className="font-bold text-primary tabular-nums text-sm">
                  {peakDay.clicks} on {formatDate(peakDay.day)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Inspector Banner */}
      <div className="h-7 my-2 flex items-center justify-between text-xs">
        {activeItem ? (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/80">
            <span className="font-semibold text-primary">{formatDate(activeItem.day)}:</span>
            <span className="font-bold tabular-nums">{activeItem.clicks} clicks</span>
            {activeItem.clicks >= Number(avgClicks) * 1.5 && activeItem.clicks > 2 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/20 text-primary">
                ⚡ Spike ({Math.round(((activeItem.clicks - Number(avgClicks)) / (Number(avgClicks) || 1)) * 100)}% above avg)
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">
            Tap or hover any daily bar to inspect exact traffic numbers.
          </span>
        )}
      </div>

      {/* 30-Day Bar Timeline Graph */}
      <div className="relative pt-2">
        {/* Baseline / Avg Guide Line */}
        {Number(avgClicks) > 0 && (
          <div
            className="absolute w-full border-t border-dashed border-muted-foreground/30 pointer-events-none z-0"
            style={{ bottom: `${Math.min(95, Math.max(8, (Number(avgClicks) / maxClicks) * 100))}%` }}
            title={`Average: ${avgClicks} clicks/day`}
          />
        )}

        <div className="flex items-end gap-1 sm:gap-1.5 h-32 w-full z-10 relative">
          {days30.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No click activity recorded in the last 30 days.
            </div>
          ) : (
            days30.map((d, idx) => {
              const isPeak = d.clicks === maxClicks && d.clicks > 0;
              const isHovered = hoveredIndex === idx;
              const heightPct = Math.max(6, (d.clicks / maxClicks) * 100);

              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                  className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      isHovered
                        ? "bg-primary scale-x-110 shadow-sm"
                        : isPeak
                        ? "bg-primary/90 border-t-2 border-amber-300"
                        : d.clicks > 0
                        ? "bg-primary/50 group-hover:bg-primary/80"
                        : "bg-muted/40 group-hover:bg-muted"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* X-Axis Dates */}
        {days30.length > 0 && (
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground tabular-nums">
            <span>{formatDate(days30[0].day)}</span>
            <span>{formatDate(days30[Math.floor(days30.length * 0.33)].day)}</span>
            <span>{formatDate(days30[Math.floor(days30.length * 0.66)].day)}</span>
            <span>{formatDate(days30[days30.length - 1].day)} (Today)</span>
          </div>
        )}
      </div>
    </div>
  );
}
