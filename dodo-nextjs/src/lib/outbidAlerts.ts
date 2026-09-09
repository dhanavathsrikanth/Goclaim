import { getBoardListings } from "./data";
import { rankListings } from "./ranking";
import { sendOutbidAlert } from "./email";
import type { Listing } from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";

// Simple in-memory rate limiter: listingId -> last alert timestamp
const lastAlerted = new Map<string, number>();

export async function processOutbidAlerts(
  updatedListing: Listing,
  previousTotalBid: number
): Promise<{ alertedCount: number; errors?: string[] }> {
  try {
    // If the bid didn't increase, no one was outbid
    if (updatedListing.total_bid <= previousTotalBid) {
      return { alertedCount: 0 };
    }

    const allListings = await getBoardListings("all-time");
    const ranked = rankListings(allListings, "all-time");

    const updatedIndex = ranked.findIndex((l) => l.id === updatedListing.id);
    const newRank = updatedIndex >= 0 ? updatedIndex + 1 : 1;

    // Find all listings that this update has now overtaken
    // (i.e. currently ranked BELOW updatedListing, but whose total_bid was >= previousTotalBid)
    const overtakenListings: { listing: Listing; rank: number }[] = [];

    for (let i = updatedIndex + 1; i < ranked.length; i++) {
      const candidate = ranked[i];
      if (candidate.id === updatedListing.id) continue;

      // Was candidate previously ahead of or tied with updatedListing?
      if (candidate.total_bid >= previousTotalBid) {
        overtakenListings.push({
          listing: candidate,
          rank: i + 1, // current new rank of the overtaken candidate
        });
      }
    }

    if (overtakenListings.length === 0) {
      return { alertedCount: 0 };
    }

    console.log(
      `[Outbid Detection] ${updatedListing.product_name || updatedListing.id} overtook ${overtakenListings.length} listing(s).`
    );

    const now = Date.now();
    let alertedCount = 0;
    const errors: string[] = [];

    for (const { listing: overtaken, rank: currentOvertakenRank } of overtakenListings) {
      // Must have valid email to send alert
      if (!overtaken.claim_email || !overtaken.claim_email.includes("@")) {
        continue;
      }

      // 10-minute rate limit per overtaken listing
      const last = lastAlerted.get(overtaken.id) || 0;
      if (now - last < 10 * 60 * 1000) {
        console.log(`[Outbid Rate Limit] Skipping alert for ${overtaken.id} (already alerted recently)`);
        continue;
      }

      // The previous rank of this listing was currentOvertakenRank - 1 (or 1 if updatedListing took #1)
      const previousRank = Math.max(1, currentOvertakenRank - 1);

      // Taking #1 requires +$5 over current #1; taking other ranks requires +$1 over the competitor
      const isReclaimingTopOne = previousRank === 1 || newRank === 1;
      const targetReclaimBid = isReclaimingTopOne
        ? updatedListing.total_bid + 5
        : updatedListing.total_bid + 1;

      const differenceAmount = Math.max(1, targetReclaimBid - overtaken.total_bid);

      const counterBidUrl = `${SITE_URL}/?raise=${encodeURIComponent(
        overtaken.slug || overtaken.id
      )}&amount=${targetReclaimBid}`;

      try {
        await sendOutbidAlert({
          to: overtaken.claim_email,
          overtakenTool: overtaken,
          outbidByTool: updatedListing,
          previousRank,
          newRank,
          targetReclaimBid,
          differenceAmount,
          counterBidUrl,
          category: overtaken.category || "General",
        });

        lastAlerted.set(overtaken.id, now);
        alertedCount++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to send outbid alert to ${overtaken.claim_email}:`, msg);
        errors.push(msg);
      }
    }

    return { alertedCount, errors };
  } catch (err: unknown) {
    console.error("Error in processOutbidAlerts:", err);
    return { alertedCount: 0, errors: [String(err)] };
  }
}
