import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/data";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getRecentActivity(20);
  return NextResponse.json({ items });
}