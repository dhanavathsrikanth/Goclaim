import { NextResponse } from "next/server";
import { getCategoryStats, getPublicStats } from "@/lib/data";

export async function GET() {
  const [categories, totals] = await Promise.all([
    getCategoryStats(),
    getPublicStats(),
  ]);
  return NextResponse.json({ categories, totals });
}