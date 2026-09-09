import Link from "next/link";
import type { Listing } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import FaviconImg from "./FaviconImg";

type Props = {
  listing: Listing;
  rank: number;
  claimAmount: number;
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
  1: "bg-primary/14",
  2: "bg-primary/8",
  3: "bg-primary/4",
};

const FAVICON_SIZE: Record<number, string> = {
  1: "size-14 md:size-18",
  2: "size-12 md:size-16",
};

export default function LeaderboardRow({ listing, rank, claimAmount, onHover, onSelectRank }: Props) {
  const displayUrl = extractDisplayUrl(listing.normalized_url);
  const isX =
    listing.normalized_url.includes("x.com") || listing.normalized_url.includes("twitter.com");
  const slug = listing.slug || listing.id;
  const tint = TINT[rank];
  const favSize = FAVICON_SIZE[rank] ?? "size-10 md:size-14";
  const spotClaimPrice = rank === 1 ? claimAmount : Math.max(2, listing.total_bid + 1);

  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`overflow-hidden rounded-xl md:rounded-2xl px-3 md:px-4 transition-colors hover:bg-muted/40 ${
        tint ?? "bg-transparent border-t border-border rounded-none md:rounded-none"
      }`}
    >
      <div className="flex items-start gap-2 py-3 md:gap-3 md:py-4">
        <span className="hidden md:inline-flex min-w-7 md:min-w-10 pt-1 text-xs md:text-base tabular-nums text-muted-foreground">
          {rank}
        </span>

        <a
          href={`/api/go/${listing.id}`}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className={`shrink-0 overflow-hidden rounded-lg bg-muted ${favSize} flex items-center justify-center`}
        >
          {listing.favicon_url ? (
            <FaviconImg
              src={listing.favicon_url}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {listing.product_name?.charAt(0) || "?"}
            </span>
          )}
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm md:text-base font-medium text-foreground">
              {listing.product_name || displayUrl}
            </p>
            <p className="shrink-0 text-sm md:text-base font-semibold tabular-nums text-foreground">
              ${listing.total_bid.toLocaleString()}
            </p>
          </div>
          {listing.description && (
            <p className="truncate text-xs md:text-sm text-muted-foreground">{listing.description}</p>
          )}
          <p className="mt-0.5 flex flex-wrap gap-x-1.5 text-[11px] md:text-xs text-muted-foreground">
            <span>{listing.category || "Other"}</span>
            <span>·</span>
            <span>{timeAgo(listing.updated_at || listing.created_at)}</span>
            <span>·</span>
            <span className="truncate max-w-32">{isX ? `@${listing.normalized_url.split("/").pop()}` : displayUrl}</span>
            <span>·</span>
            <span className="tabular-nums">{listing.click_count.toLocaleString()} clicks</span>
            <span>·</span>
            <Link href={`/listings/${slug}`} className="hover:text-foreground hover:underline">
              see details
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectRank?.();
              }}
              className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer"
            >
              claim this rank for ${spotClaimPrice.toLocaleString()}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
