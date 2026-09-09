import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import {
  getComposioStatus,
  postSocialProof,
  announceDailyChampion,
  getTwitterConnectUrl,
} from "@/lib/composio";
import { getActiveSponsor, getListingById, snapshotSponsors } from "@/lib/data";

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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
