import Link from "next/link";
import type { Listing } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import FaviconImg from "./FaviconImg";
import CategoryIcon from "./CategoryIcon";

type Props = {
  listing: Listing;
  rank: number;
  claimAmount: number;
  source?: string;
  isSelected?: boolean;
  onHover?: (hovering: boolean) => void;
  onSelectRank?: () => void;
};

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} days ago`;
  if (s < 86400 * 30) return `${Math.floor(s / (86400 * 7))} weeks ago`;
  return new Date(iso).toLocaleDateString();
}

const TINT: Record<number, string> = {
  1: "bg-primary/14 border border-primary/30 shadow-xs",
  2: "bg-primary/8 border border-primary/20",
  3: "bg-primary/4 border border-primary/15",
};

const FAVICON_SIZE: Record<number, string> = {
  1: "size-14 md:size-18",
  2: "size-12 md:size-16",
};

export default function LeaderboardRow({
  listing,
  rank,
  claimAmount,
  source = "all-time",
  isSelected = false,
  onHover,
  onSelectRank,
}: Props) {
  const displayUrl = extractDisplayUrl(listing.normalized_url);
  const isX =
    listing.normalized_url.includes("x.com") || listing.normalized_url.includes("twitter.com");
  const slug = listing.slug || listing.id;
  const tint = TINT[rank];
  const favSize = FAVICON_SIZE[rank] ?? "size-10 md:size-14";
  const spotClaimPrice = rank === 1 ? claimAmount : Math.max(2, listing.total_bid + 1);
  const outboundUrl = `/api/go/${listing.id}?from=${encodeURIComponent(source || "all-time")}`;

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't trigger outer card redirect if user clicked a link or button inside (e.g. see details or claim this rank)
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
      aria-label={`Visit ${listing.product_name || displayUrl}`}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`group relative cursor-pointer overflow-hidden rounded-xl md:rounded-2xl transition-all ${
        isSelected
          ? "ring-2 ring-primary border-primary/50 bg-primary/10 shadow-sm"
          : "hover:bg-muted/60"
      } ${tint ?? "bg-card/40 border border-border/60 hover:border-border"}`}
    >
      {/* Short Claim Banner at Top of Card */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelectRank?.();
        }}
        role="button"
        tabIndex={0}
        aria-label={`Claim spot #${rank} for $${spotClaimPrice.toLocaleString()}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onSelectRank?.();
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs border-b cursor-pointer transition-colors ${
          isSelected
            ? "flex bg-primary/20 border-primary/40 text-primary font-semibold"
            : "flex md:hidden md:group-hover:flex bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          <span className="truncate font-medium text-[11px] sm:text-xs">
            Claim <span className="font-bold font-mono">#{rank}</span> for{" "}
            <span className="font-bold font-mono">${spotClaimPrice.toLocaleString()}</span>
          </span>
        </div>

        <span className="shrink-0 font-semibold text-[11px] sm:text-xs flex items-center gap-1 hover:underline ml-2">
          <span>Claim spot</span>
          <span>→</span>
        </span>
      </div>

      <div className="flex items-start gap-2.5 p-3 md:p-4 md:gap-3.5">
        <span className="hidden md:inline-flex min-w-7 md:min-w-9 pt-1 text-xs md:text-base tabular-nums text-muted-foreground font-medium">
          {rank}
        </span>

        <a
          href={outboundUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className={`shrink-0 overflow-hidden rounded-lg bg-muted ${favSize} flex items-center justify-center transition-transform group-hover:scale-105`}
        >
          {listing.favicon_url ? (
            <FaviconImg
              src={listing.favicon_url}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground group-hover:text-primary transition-colors">
              <CategoryIcon category={listing.category || "Other"} className="size-5" />
            </div>
          )}
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <a
              href={outboundUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="truncate text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>{listing.product_name || displayUrl}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">↗</span>
            </a>
            <p className="shrink-0 text-sm md:text-base font-semibold tabular-nums text-foreground">
              {listing.claimed_free ? (
                <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs md:text-sm font-bold text-emerald-600">
                  FREE
                </span>
              ) : (
                <>${listing.total_bid.toLocaleString()}</>
              )}
            </p>
          </div>
          {listing.description && (
            <p className="truncate text-xs md:text-sm text-muted-foreground mt-0.5">{listing.description}</p>
          )}
          {listing.founder_note && (
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] md:text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 max-w-full truncate shadow-2xs">
                <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="truncate">{listing.founder_note}</span>
              </span>
            </div>
          )}
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] md:text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium">
              <CategoryIcon category={listing.category || "Other"} className="size-3 shrink-0 opacity-75" />
              <span>{listing.category || "Other"}</span>
            </span>
            <span>·</span>
            <span>{timeAgo(listing.updated_at || listing.created_at)}</span>
            <span>·</span>
            <a
              href={outboundUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="truncate max-w-36 hover:text-foreground hover:underline"
            >
              {isX ? `@${listing.normalized_url.split("/").pop()}` : displayUrl}
            </a>
            <span>·</span>
            <span className="tabular-nums font-medium">{listing.click_count.toLocaleString()} clicks</span>
            {listing.promo_code && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  <span>🏷️</span>
                  <span>{listing.promo_code}</span>
                </span>
              </>
            )}
            <span>·</span>
            <Link
              href={`/listings/${slug}`}
              className="hover:text-foreground hover:underline text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              see details
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectRank?.();
              }}
              className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer"
            >
              claim for ${spotClaimPrice.toLocaleString()}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
