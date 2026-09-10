import { NextRequest, NextResponse } from "next/server";
import { getBoardListings } from "@/lib/data";
import type { BoardType } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const board = (req.nextUrl.searchParams.get("board") || "all-time") as BoardType;
  const category = req.nextUrl.searchParams.get("category") || undefined;

  const boardListings = await getBoardListings(board);
  const topBid = boardListings.length
    ? Math.max(...boardListings.map((l) => l.total_bid))
    : 0;
  const allTimeListings = await getBoardListings("all-time");
  const topBidAll = allTimeListings.length
    ? Math.max(...allTimeListings.map((l) => l.total_bid))
    : 0;

  let listings = boardListings;
  if (category && category !== "All") {
    if ((CATEGORIES as readonly string[]).includes(category)) {
      listings = boardListings.filter((l) => l.category === category);
    }
  }

  const categoryCounts: Record<string, number> = {};
  for (const l of boardListings) {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  }

  return NextResponse.json({
    listings: listings.slice(0, 50),
    total: listings.length,
    top_bid: topBid,
    top_bid_all: topBidAll,
    categories: categoryCounts,
    board,
  });
}