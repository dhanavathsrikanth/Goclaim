"use client";
import { useState, useEffect } from "react";
import type { SponsorEntry } from "@/lib/types";

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

export default function SponsorBanner({ sponsor, validUntil }: Props) {
  const [left, setLeft] = useState(
    () => new Date(validUntil).getTime() - Date.now()
  );

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(new Date(validUntil).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [validUntil]);

  const handleBannerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    window.open(`/api/go/${sponsor.listing_id}?from=sponsor_banner`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleBannerClick}
      className="mb-6 rounded-2xl border border-[#e57255]/30 bg-[#e57255]/8 p-4 sm:p-5 text-left shadow-2xs backdrop-blur-xs cursor-pointer hover:border-[#e57255]/60 hover:bg-[#e57255]/12 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e57255]">
          <span>👑</span> Active Daily Sponsor
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {left > 0 ? `Resets in ${formatLeft(left)}` : "Slot resetting..."}
        </span>
      </div>

      <div className="flex items-start gap-4">
        {sponsor.favicon_url && (
          <img
            src={sponsor.favicon_url}
            alt=""
            className="w-12 h-12 rounded-xl object-cover bg-background/50 p-1 border border-border shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {sponsor.product_name || "Featured Project"}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e57255]/20 text-[#e57255] border border-[#e57255]/40 shrink-0">
              #1 Sponsor
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {sponsor.url.replace(/^https?:\/\//, "").replace(/\/+$/, "")} · Backed by a $
            {sponsor.total_bid.toLocaleString()} bid
          </p>
        </div>
      </div>

      {sponsor.banner_url && sponsor.creative_approved && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border/50 max-h-48 bg-black/20">
          <img
            src={sponsor.banner_url}
            alt=""
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40 text-xs">
        <span className="text-muted-foreground">
          Hold #1 on Daily at 00:00 UTC to claim this banner tomorrow.
        </span>
        <a
          href={`/api/go/${sponsor.listing_id}?from=sponsor_banner`}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[#e57255] hover:bg-[#d15d40] text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
        >
          Visit →
        </a>
      </div>
    </div>
  );
}