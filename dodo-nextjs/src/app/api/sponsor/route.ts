import { NextResponse } from "next/server";
import { getActiveSponsor } from "@/lib/data";
export const dynamic = "force-dynamic";

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

export async function GET() {
  const active = await getActiveSponsor();
  if (!active || active.entries.length === 0) {
    return NextResponse.json({
      sponsor: null,
      top3: [],
      snapshot_date: null,
      valid_until: nextMidnightUTC(),
    });
  }
  return NextResponse.json({
    snapshot_date: active.snapshot_date,
    sponsor: active.entries[0],
    top3: active.entries,
    valid_until: nextMidnightUTC(),
  });
}