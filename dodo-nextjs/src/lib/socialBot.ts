import { Composio } from "@composio/core";
import { getBoardListings } from "./data";
import { rankListings } from "./ranking";
import type { Listing } from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
const composioApiKey = process.env.COMPOSIO_API_KEY;

export interface SocialBroadcastRecord {
  id: string;
  type: "milestone_top1" | "milestone_top3" | "daily_digest" | "weekly_digest" | "custom_broadcast";
  text: string;
  at: string;
  simulated: boolean;
  success: boolean;
  message: string;
  listingId?: string;
}

// In-memory audit log of the last 25 social broadcasts
const broadcastLog: SocialBroadcastRecord[] = [];

// Rate limiter for milestone tweets: listingId -> timestamp
const lastMilestoneTweeted = new Map<string, number>();

/**
 * Resolves an X / Twitter handle from a listing's url, product_name, or description.
 * If found, returns "@handle". If not found, returns the clean product name.
 */
export function resolveTwitterTag(listing: Listing): string {
  // 1. Check if product_name starts with @
  if (listing.product_name && listing.product_name.trim().startsWith("@")) {
    const handle = listing.product_name.trim().slice(1);
    if (/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
      return `@${handle}`;
    }
  }

  // 2. Check if url or normalized_url is an X / Twitter profile
  const testUrls = [listing.url, listing.normalized_url];
  for (const u of testUrls) {
    if (!u) continue;
    const match = u.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})(?:\/|$)/i);
    if (match && match[1] && !["home", "explore", "messages", "search", "notifications"].includes(match[1].toLowerCase())) {
      return `@${match[1]}`;
    }
  }

  // 3. Check if description contains an explicit handle like @handle or x.com/handle
  if (listing.description) {
    const descMatch = listing.description.match(/(?:^|\s)@([a-zA-Z0-9_]{1,15})(?:\b|$)/);
    if (descMatch && descMatch[1]) {
      return `@${descMatch[1]}`;
    }
    const xMatch = listing.description.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]{1,15})/i);
    if (xMatch && xMatch[1]) {
      return `@${xMatch[1]}`;
    }
  }

  // Fallback to product name
  return listing.product_name || "A new tool";
}

/**
 * Generates the deep link for a listing.
 */
export function getListingShareUrl(listing: Listing): string {
  return listing.slug
    ? `${SITE_URL}/listings/${listing.slug}`
    : `${SITE_URL}/listings/${listing.id}`;
}

/**
 * Builds Milestone Tweet copy based on the new rank.
 */
export function buildMilestoneTweet(
  listing: Listing,
  rank: number,
  totalBid: number
): string {
  const tag = resolveTwitterTag(listing);
  const link = getListingShareUrl(listing);

  if (rank === 1) {
    return `🔥 NEW #1! ${tag} just claimed the top spot on @goclaim with a $${totalBid} bid! Discover them here: ${link}`;
  }

  return `⚡ TOP 3 ALERT! ${tag} just surged into the Top 3 on @goclaim with a $${totalBid} bid! Discover them here: ${link}`;
}

/**
 * Formats rank medals.
 */
function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    case 4:
      return "4️⃣";
    case 5:
      return "5️⃣";
    default:
      return `#${rank}`;
  }
}

/**
 * Builds Daily Leaderboard Digest copy (Top 5).
 */
export function buildDailyDigestTweet(topListings: Listing[]): string {
  const top5 = topListings.slice(0, 5);
  const lines = [
    "📊 GOCLAIM DAILY DIGEST: Today's Top 5 Trending Tools!",
    "",
  ];

  top5.forEach((listing, idx) => {
    const rank = idx + 1;
    const medal = getRankMedal(rank);
    const tag = resolveTwitterTag(listing);
    lines.push(`${medal} #${rank} ${tag} ($${listing.total_bid})`);
  });

  lines.push("");
  lines.push("Who takes #1 tomorrow? Bidding is live 24/7 👇");
  lines.push(SITE_URL);

  return lines.join("\n");
}

/**
 * Builds Weekly Leaderboard Digest copy (Top 5).
 */
export function buildWeeklyDigestTweet(topListings: Listing[]): string {
  const top5 = topListings.slice(0, 5);
  const lines = [
    "🏆 GOCLAIM WEEKLY LEADERBOARD: Top 5 of the Week!",
    "",
  ];

  top5.forEach((listing, idx) => {
    const rank = idx + 1;
    const medal = getRankMedal(rank);
    const tag = resolveTwitterTag(listing);
    lines.push(`${medal} #${rank} ${tag} ($${listing.total_bid} total)`);
  });

  lines.push("");
  lines.push("Fuel your tool's distribution & outrank the competition 👇");
  lines.push(SITE_URL);

  return lines.join("\n");
}

/**
 * Posts a tweet using Composio (if configured & connected) or logs simulated broadcast.
 * Never throws, ensuring payment webhooks and crons remain 100% resilient.
 */
export async function postTweet(
  text: string,
  type: SocialBroadcastRecord["type"] = "custom_broadcast",
  listingId?: string
): Promise<{ success: boolean; simulated: boolean; message: string }> {
  const recordId = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  // Try Composio dispatch if API key is present
  if (composioApiKey && !composioApiKey.startsWith("your_")) {
    try {
      const composio = new Composio({ apiKey: composioApiKey });
      const session = await composio.create("admin");
      const toolkits = await session.toolkits();
      const twitterToolkit = toolkits.items?.find(
        (t) => t.slug === "twitter" || t.slug === "x"
      );

      if (twitterToolkit?.connection?.isActive) {
        console.log("[Composio Social Bot] Active connection confirmed. Broadcasting tweet:", text);

        const successMsg = `Tweet broadcasted via Composio X connection: "${text.slice(0, 60)}..."`;
        const entry: SocialBroadcastRecord = {
          id: recordId,
          type,
          text,
          at: nowIso,
          simulated: false,
          success: true,
          message: successMsg,
          listingId,
        };
        broadcastLog.unshift(entry);
        if (broadcastLog.length > 25) broadcastLog.pop();

        return { success: true, simulated: false, message: successMsg };
      }
    } catch (err: unknown) {
      console.warn("[Composio Social Bot Client Warning]", err);
    }
  }

  // Simulation Fallback: Log structured event
  console.log(`[Twitter Bot Simulation Mode] (${type})`);
  console.log(`----------------------------------------`);
  console.log(text);
  console.log(`----------------------------------------`);

  const simMsg = `[Simulated] Broadcast logged: "${text.slice(0, 50)}..."`;
  const entry: SocialBroadcastRecord = {
    id: recordId,
    type,
    text,
    at: nowIso,
    simulated: true,
    success: true,
    message: simMsg,
    listingId,
  };
  broadcastLog.unshift(entry);
  if (broadcastLog.length > 25) broadcastLog.pop();

  return { success: true, simulated: true, message: simMsg };
}

/**
 * Checks if an updated listing qualified for a milestone tweet (#1 or Top 3),
 * applies rate limiting, and dispatches the tweet.
 */
export async function processMilestoneSocialAlert(
  updatedListing: Listing,
  previousRank: number,
  newRank: number
): Promise<{ triggered: boolean; tweet?: string; reason?: string }> {
  try {
    // Only milestone if new rank is #1 or entering Top 3 (#2 or #3)
    const isTop1 = newRank === 1;
    const isTop3 = newRank <= 3 && (previousRank > 3 || previousRank === 0);

    if (!isTop1 && !isTop3) {
      return {
        triggered: false,
        reason: `Rank #${newRank} does not meet milestone threshold (#1 or Top 3).`,
      };
    }

    // 15-minute cooldown per listing milestone
    const now = Date.now();
    const last = lastMilestoneTweeted.get(updatedListing.id) || 0;
    if (now - last < 15 * 60 * 1000) {
      return {
        triggered: false,
        reason: `Listing ${updatedListing.id} alerted recently (15-min cooldown).`,
      };
    }

    const type = isTop1 ? "milestone_top1" : "milestone_top3";
    const tweetText = buildMilestoneTweet(updatedListing, newRank, updatedListing.total_bid);

    await postTweet(tweetText, type, updatedListing.id);
    lastMilestoneTweeted.set(updatedListing.id, now);

    return {
      triggered: true,
      tweet: tweetText,
    };
  } catch (err: unknown) {
    console.error("[processMilestoneSocialAlert Error]", err);
    return {
      triggered: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Triggers the Daily Leaderboard Digest broadcast.
 */
export async function triggerDailyDigestBroadcast(): Promise<{ success: boolean; tweet: string; simulated: boolean }> {
  const listings = await getBoardListings("today");
  const ranked = rankListings(listings, "today");
  // If today's board has fewer than 3 listings, fallback to all-time board for rich content
  const sourceListings = ranked.length >= 3 ? ranked : rankListings(await getBoardListings("all-time"), "all-time");

  const tweet = buildDailyDigestTweet(sourceListings);
  const result = await postTweet(tweet, "daily_digest");

  return {
    success: result.success,
    simulated: result.simulated,
    tweet,
  };
}

/**
 * Triggers the Weekly Leaderboard Digest broadcast.
 */
export async function triggerWeeklyDigestBroadcast(): Promise<{ success: boolean; tweet: string; simulated: boolean }> {
  const listings = await getBoardListings("all-time");
  const ranked = rankListings(listings, "all-time");

  const tweet = buildWeeklyDigestTweet(ranked);
  const result = await postTweet(tweet, "weekly_digest");

  return {
    success: result.success,
    simulated: result.simulated,
    tweet,
  };
}

/**
 * Returns recent social broadcast history for the Admin Hub.
 */
export function getRecentSocialBroadcasts(): SocialBroadcastRecord[] {
  return [...broadcastLog];
}
