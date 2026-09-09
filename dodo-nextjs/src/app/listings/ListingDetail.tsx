import type { Listing } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import RelatedListings from "../components/RelatedListings";
import ShareButtons from "../components/ShareButtons";
import FaviconImg from "../components/FaviconImg";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Props = {
  listing: Listing;
  rank: number;
  related: Listing[];
};

export default function ListingDetail({ listing, rank, related }: Props) {
  const displayUrl = extractDisplayUrl(listing.normalized_url);

  return (
    <div className="flex-1 w-full pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="border border-border bg-card rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            {listing.favicon_url ? (
              <FaviconImg
                src={listing.favicon_url}
                className="w-12 h-12 rounded-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground border border-border/50">
                {listing.product_name?.charAt(0) || "?"}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground break-words">
                {listing.product_name}
              </h1>
              <p className="text-sm text-muted-foreground font-mono break-all">{displayUrl}</p>
            </div>
          </div>

          {listing.description && (
            <p className="text-foreground/80 text-sm mb-6 leading-relaxed">{listing.description}</p>
          )}

          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-muted/30 border border-border/60 rounded-xl p-3 sm:p-4 text-center min-w-0">
              <p className="text-lg sm:text-3xl font-bold tracking-tight text-foreground break-all tabular-nums">#{rank}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Rank</p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-3 sm:p-4 text-center min-w-0">
              <p className="text-lg sm:text-3xl font-bold tracking-tight text-foreground break-all tabular-nums">
                ${listing.total_bid.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Bid</p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-3 sm:p-4 text-center min-w-0">
              <p className="text-lg sm:text-3xl font-bold tracking-tight text-foreground break-all tabular-nums">
                {listing.click_count.toLocaleString()}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Clicks</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 px-1">
            <span>Category: <strong className="text-foreground font-medium">{listing.category}</strong></span>
            <span>
              Listed: {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>

          <a
            href={`/api/go/${listing.id}`}
            rel="sponsored"
            className="block w-full py-3 px-4 rounded-lg bg-white text-black font-medium text-center hover:bg-neutral-200 transition-colors"
          >
            Visit
          </a>

          <ShareButtons
            pageUrl={`${SITE_URL}/listings/${listing.slug || listing.id}`}
            productName={listing.product_name || displayUrl}
            bid={listing.total_bid}
          />
        </div>

        <RelatedListings items={related} category={listing.category} />
      </div>
    </div>
  );
}