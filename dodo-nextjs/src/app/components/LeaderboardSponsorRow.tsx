"use client";
import { useState, useEffect } from "react";
import type { SponsorEntry } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import FaviconImg from "./FaviconImg";

function formatLeft(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

type Props = {
  sponsor: SponsorEntry;
  validUntil: string;
};

export default function LeaderboardSponsorRow({ sponsor, validUntil }: Props) {
  const [left, setLeft] = useState(
    () => new Date(validUntil).getTime() - Date.now()
  );

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(new Date(validUntil).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [validUntil]);

  const outboundUrl = `/api/go/${sponsor.listing_id}?from=sponsor_banner`;
  const displayUrl = extractDisplayUrl(sponsor.url);

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("[role='button']")) {
      return;
    }
    window.open(outboundUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          window.open(outboundUrl, "_blank", "noopener,noreferrer");
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Visit Sponsor ${sponsor.product_name || displayUrl}`}
      className="group relative cursor-pointer overflow-hidden rounded-xl md:rounded-2xl border-2 border-[#e57255]/40 bg-gradient-to-r from-[#e57255]/10 via-[#e57255]/5 to-card/60 hover:border-[#e57255]/70 hover:bg-[#e57255]/15 transition-all shadow-xs"
    >
      {/* Top Sponsor Banner Strip */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 text-xs border-b border-[#e57255]/20 bg-[#e57255]/15 text-[#e57255]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 font-bold text-[10px] md:text-xs tracking-wider uppercase">
            <span>👑</span> Active Daily Sponsor
          </span>
          <span className="hidden sm:inline-block text-[#e57255]/60">•</span>
          <span className="hidden sm:inline-block text-[11px] text-[#e57255]/90 font-medium truncate">
            Hold #1 on Daily at 00:00 UTC to claim this spot
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-mono font-medium text-foreground/80 tabular-nums">
          <span className="text-muted-foreground hidden sm:inline">Resets in</span>
          <span className="font-semibold text-primary">{left > 0 ? formatLeft(left) : "00:00:00"}</span>
        </div>
      </div>

      {/* Main Row Content */}
      <div className="flex items-center gap-3 p-3 md:p-4 md:gap-4">
        <span className="hidden md:inline-flex min-w-7 md:min-w-9 items-center justify-center text-xs font-bold text-[#e57255] tracking-tight">
          VIP
        </span>

        <a
          href={outboundUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="shrink-0 size-11 md:size-14 overflow-hidden rounded-xl bg-background/80 border border-[#e57255]/30 p-1 flex items-center justify-center transition-transform group-hover:scale-105"
        >
          {sponsor.favicon_url ? (
            <FaviconImg
              src={sponsor.favicon_url}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span className="text-lg">⭐</span>
          )}
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <a
                href={outboundUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="truncate text-sm md:text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{sponsor.product_name || displayUrl}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">↗</span>
              </a>
              <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#e57255]/20 text-[#e57255] border border-[#e57255]/30 shrink-0">
                #1 Sponsor
              </span>
            </div>
            <p className="shrink-0 text-xs md:text-sm font-semibold tabular-nums text-muted-foreground">
              Backed by <span className="text-foreground font-bold">${sponsor.total_bid.toLocaleString()}</span>
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] md:text-xs text-muted-foreground">
            <span className="truncate max-w-44 text-foreground/80 font-medium">{displayUrl}</span>
            <span>·</span>
            <span className="text-emerald-500 font-medium">Guaranteed 24h Feature</span>
            <span>·</span>
            <span className="text-muted-foreground">Daily Leaderboard Winner</span>
          </div>
        </div>

        <div className="shrink-0 pl-1">
          <a
            href={outboundUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-[#e57255] hover:bg-[#d15d40] text-white font-semibold text-xs transition-colors shrink-0 shadow-xs inline-flex items-center gap-1"
          >
            <span>Visit</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
