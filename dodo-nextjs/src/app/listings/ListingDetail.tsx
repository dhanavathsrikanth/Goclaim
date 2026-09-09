"use client";

import { useState } from "react";
import type { Listing } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import RelatedListings from "../components/RelatedListings";
import ShareButtons from "../components/ShareButtons";
import FaviconImg from "../components/FaviconImg";
import CategoryIcon from "../components/CategoryIcon";
import EmbedBadgeModal from "../components/EmbedBadgeModal";
import PromoCodeBox from "../components/PromoCodeBox";
import DemoEmbed from "../components/DemoEmbed";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Props = {
  listing: Listing;
  rank: number;
  related: Listing[];
};

export default function ListingDetail({ listing, rank, related }: Props) {
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
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
              <div className="w-14 h-14 rounded-xl bg-muted/80 flex items-center justify-center text-primary border border-border/50">
                <CategoryIcon category={listing.category} className="size-7" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground break-words">
                {listing.product_name}
              </h1>
              <p className="text-sm text-muted-foreground font-mono break-all">{displayUrl}</p>
            </div>
          </div>

          {listing.founder_note && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold mb-6 shadow-xs max-w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="truncate">{listing.founder_note}</span>
            </div>
          )}

          {listing.description && (
            <p className="text-foreground/80 text-sm mb-6 leading-relaxed">{listing.description}</p>
          )}

          {listing.demo_url && listing.demo_url.trim() && !listing.demo_url.includes("oFfGs3rC7X8") ? (
            <DemoEmbed demoUrl={listing.demo_url.trim()} productName={listing.product_name || displayUrl} />
          ) : null}

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
            <div className="flex items-center gap-1.5">
              <span>Category:</span>
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <CategoryIcon category={listing.category} className="size-3.5 text-primary shrink-0" />
                {listing.category}
              </span>
            </div>
            <span>
              Listed: {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>

          {listing.promo_code && (
            <PromoCodeBox
              promoCode={listing.promo_code}
              promoOffer={listing.promo_offer}
              productName={listing.product_name || displayUrl}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
            <a
              href={`/api/go/${listing.id}?from=listing_page`}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-center hover:bg-primary/90 transition-all shadow-xs"
            >
              {listing.normalized_url.includes("x.com") || listing.normalized_url.includes("twitter.com")
                ? "Visit Profile on 𝕏 ↗"
                : "Visit Website ↗"}
            </a>
            <button
              type="button"
              onClick={() => setIsBadgeModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-muted/50 hover:bg-muted border border-border text-foreground font-semibold text-center transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              <span>Embed Badge</span>
            </button>
          </div>

          <ShareButtons
            pageUrl={`${SITE_URL}/listings/${listing.slug || listing.id}`}
            productName={listing.product_name || displayUrl}
            bid={listing.total_bid}
          />
        </div>

        <EmbedBadgeModal
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
          slug={listing.slug || listing.id}
          productName={listing.product_name || displayUrl}
          category={listing.category}
          rank={rank}
        />

        <RelatedListings items={related} category={listing.category} />
      </div>
    </div>
  );
}