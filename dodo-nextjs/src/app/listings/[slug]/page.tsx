import { permanentRedirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getListingById,
  getListingBySlug,
  getListings,
  getRelatedListings,
} from "@/lib/data";
import { rankListings } from "@/lib/ranking";
import { extractDisplayUrl } from "@/lib/normalize";
import type { Listing } from "@/lib/types";
import ListingDetail from "../ListingDetail";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveListing(slug: string): Promise<{
  listing: Listing | undefined;
  viaId: boolean;
}> {
  if (slug.startsWith("lst_")) {
    return { listing: await getListingById(slug), viaId: true };
  }
  return { listing: await getListingBySlug(slug), viaId: false };
}

function listingTitle(listing: Listing): string {
  const name = listing.product_name || extractDisplayUrl(listing.normalized_url);
  return `${name} — $${listing.total_bid.toLocaleString()} bid | goclaim.space`;
}

function listingDescription(listing: Listing): string {
  const name = listing.product_name || extractDisplayUrl(listing.normalized_url);
  return `${name} (${extractDisplayUrl(listing.normalized_url)}) holds its rank on goclaim.space with a $${listing.total_bid.toLocaleString()} bid in ${listing.category}. Outbid them to take the spot.`;
}

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { listing } = await resolveListing(slug);

  if (!listing || listing.status !== "confirmed") {
    return { title: "Listing not found | goclaim.space" };
  }

  const title = listingTitle(listing);
  const description = listingDescription(listing);
  const url = `${SITE_URL}/listings/${listing.slug || listing.id}`;
  // Static share card (public/og-fallback.png). Per-listing dynamic PNGs are
  // parked until a Workers-safe renderer works under the OpenNext bundle
  // (cf-workers-og hits an fs.readFile wall at request time on workerd).
  const card = `${SITE_URL}/og-fallback.png`;
  const creative =
    listing.banner_url || listing.logo_url || listing.favicon_url || undefined;
  const images = [{ url: card }, ...(creative ? [{ url: creative }] : [])];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "goclaim.space",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card],
    },
  };
}

export default async function SlugListingPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const { listing, viaId } = await resolveListing(slug);

  if (!listing || listing.status !== "confirmed") {
    notFound();
  }

  // Old /listings/<id> URLs permanently redirect to the canonical slug URL.
  if (viaId && listing.slug) {
    permanentRedirect(`/listings/${listing.slug}`);
  }

  const allListings = await getListings();
  const ranked = rankListings(allListings, "all-time");
  const rank = ranked.findIndex((l) => l.id === listing.id) + 1;
  const related = await getRelatedListings(listing);

  return <ListingDetail listing={listing} rank={rank} related={related} />;
}