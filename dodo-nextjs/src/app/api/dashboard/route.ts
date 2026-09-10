import { NextRequest, NextResponse } from "next/server";
import { verifyClaimToken } from "@/lib/claim";
import {
  getListingsByEmail,
  getBoardListings,
  getClicksByDay,
  getReferralBreakdown,
  calculateRoiMetrics,
  getPaymentsByListingId,
  getActiveSponsor,
} from "@/lib/data";
import type { BoardType } from "@/lib/types";
export const dynamic = "force-dynamic";

const BOARDS: BoardType[] = ["all-time", "today", "daily"];

function nextMidnightUTC(): string {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    )
  ).toISOString();
}

export async function GET(req: NextRequest) {
  const claim = new URL(req.url).searchParams.get("claim") ?? "";
  const email = verifyClaimToken(claim);
  if (!email) {
    return NextResponse.json({ error: "Invalid claim token." }, { status: 401 });
  }

  const listings = await getListingsByEmail(email);
  const active = await getActiveSponsor();
  const liveId = active && active.entries.length > 0 ? active.entries[0].listing_id : null;

  const items = [];
  for (const listing of listings) {
    const ranks: Record<string, number | null> = {};
    for (const board of BOARDS) {
      const rows = await getBoardListings(board);
      const idx = rows.findIndex((l) => l.id === listing.id);
      ranks[board] = idx >= 0 ? idx + 1 : null;
    }

    const clicksByDay = await getClicksByDay(listing.id, 30);
    const referralBreakdown = await getReferralBreakdown(listing.id, listing.click_count);
    const roi = calculateRoiMetrics(listing.total_bid, listing.click_count);

    items.push({
      listing,
      ranks,
      clicks_by_day: clicksByDay,
      referral_breakdown: referralBreakdown,
      roi,
      payments: await getPaymentsByListingId(listing.id),
      ad_live: liveId === listing.id,
      ad_valid_until: nextMidnightUTC(),
    });
  }

  return NextResponse.json({ email, listings: items });
}