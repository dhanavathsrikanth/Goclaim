import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import {
  getComposioStatus,
  postSocialProof,
  announceDailyChampion,
  getTwitterConnectUrl,
} from "@/lib/composio";
import { getActiveSponsor, getListingById, snapshotSponsors, getBoardListings } from "@/lib/data";
import { rankListings } from "@/lib/ranking";
import {
  buildMilestoneTweet,
  buildDailyDigestTweet,
  buildWeeklyDigestTweet,
  triggerDailyDigestBroadcast,
  triggerWeeklyDigestBroadcast,
  getRecentSocialBroadcasts,
  postTweet,
} from "@/lib/socialBot";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("connect") === "twitter") {
    const callbackUrl = `${new URL(req.url).origin}/admin?connect=success`;
    const connectUrl = await getTwitterConnectUrl(callbackUrl);
    return NextResponse.json({ connectUrl });
  }

  if (searchParams.get("action") === "preview_social") {
    const allListings = await getBoardListings("all-time");
    const todayListings = await getBoardListings("today");
    const rankedAll = rankListings(allListings, "all-time");
    const rankedToday = rankListings(todayListings, "today");

    const sampleLead = rankedAll[0] || {
      id: "demo",
      url: "https://x.com/cursor_ai",
      normalized_url: "https://x.com/cursor_ai",
      product_name: "@Cursor_ai",
      description: "AI code editor",
      favicon_url: "",
      category: "Developer Tools",
      total_bid: 250,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "confirmed" as const,
      claim_email: "",
      banner_url: "",
      logo_url: "",
      slug: "cursor",
      creative_approved: true,
    };

    const sampleTop3 = rankedAll[1] || {
      id: "demo-2",
      url: "https://v0.dev",
      normalized_url: "https://v0.dev",
      product_name: "v0 by Vercel",
      description: "Generative UI system",
      favicon_url: "",
      category: "Developer Tools",
      total_bid: 180,
      click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "confirmed" as const,
      claim_email: "",
      banner_url: "",
      logo_url: "",
      slug: "v0",
      creative_approved: true,
    };

    const sourceDaily = rankedToday.length >= 3 ? rankedToday : rankedAll;

    return NextResponse.json({
      ok: true,
      previews: {
        milestone_top1: buildMilestoneTweet(sampleLead, 1, sampleLead.total_bid),
        milestone_top3: buildMilestoneTweet(sampleTop3, 2, sampleTop3.total_bid),
        daily_digest: buildDailyDigestTweet(sourceDaily),
        weekly_digest: buildWeeklyDigestTweet(rankedAll),
      },
      history: getRecentSocialBroadcasts(),
    });
  }

  const status = await getComposioStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, text } = body;

    if (action === "test_broadcast") {
      if (!text || typeof text !== "string") {
        return NextResponse.json(
          { error: "Broadcast message text is required." },
          { status: 400 }
        );
      }
      const result = await postSocialProof(text.trim());
      return NextResponse.json(result);
    }

    if (action === "trigger_daily_champion") {
      // Snapshot first to ensure current state
      await snapshotSponsors();
      const active = await getActiveSponsor();

      if (!active || active.entries.length === 0) {
        return NextResponse.json({
          success: false,
          message: "No active sponsor entries found to announce.",
        });
      }

      const topWinner = active.entries[0];
      const listing = await getListingById(topWinner.listing_id);
      const result = await announceDailyChampion({
        product_name: topWinner.product_name,
        total_bid: topWinner.total_bid,
        slug: listing?.slug,
        url: topWinner.url,
      });

      return NextResponse.json(result);
    }

    if (action === "trigger_daily_digest") {
      const result = await triggerDailyDigestBroadcast();
      return NextResponse.json(result);
    }

    if (action === "trigger_weekly_digest") {
      const result = await triggerWeeklyDigestBroadcast();
      return NextResponse.json(result);
    }

    if (action === "trigger_milestone_test") {
      const all = await getBoardListings("all-time");
      const ranked = rankListings(all, "all-time");
      const target = ranked[0] || {
        id: "demo",
        url: "https://x.com/cursor_ai",
        normalized_url: "https://x.com/cursor_ai",
        product_name: "@Cursor_ai",
        description: "AI code editor",
        favicon_url: "",
        category: "Developer Tools",
        total_bid: 250,
        click_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "confirmed" as const,
        claim_email: "",
        banner_url: "",
        logo_url: "",
        slug: "cursor",
        creative_approved: true,
      };

      const tweet = buildMilestoneTweet(target, 1, target.total_bid);
      const result = await postTweet(tweet, "milestone_top1", target.id);
      return NextResponse.json({ ...result, tweet });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
