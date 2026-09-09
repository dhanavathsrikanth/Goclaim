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

  return (
    <div className="mb-6 rounded-2xl border border-[#e57255]/30 bg-[#e57255]/8 p-4 sm:p-5 text-left shadow-2xs backdrop-blur-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#e57255]">
          <span>👑</span> Active Daily Sponsor
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          Valid until 00:00 UTC · <span className="font-semibold text-foreground">{formatLeft(left)}</span> left
        </span>
      </div>
      {sponsor.creative_approved && sponsor.banner_url ? (
        <img
          src={sponsor.banner_url}
          alt=""
          className="w-full max-h-40 rounded-xl border border-border/80 object-cover mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <div className="flex items-center gap-4">
        {sponsor.favicon_url ? (
          <img
            src={sponsor.favicon_url}
            alt=""
            className="w-12 h-12 rounded-xl border border-border/80 object-cover bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-xl font-bold text-[#e57255]">
            {sponsor.product_name?.charAt(0) || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-bold text-foreground truncate">
            {sponsor.product_name || sponsor.url}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            Won #1 slot at daily cutoff with a bid of ${sponsor.total_bid.toLocaleString()}
          </p>
        </div>
        <a
          href={`/api/go/${sponsor.listing_id}`}
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