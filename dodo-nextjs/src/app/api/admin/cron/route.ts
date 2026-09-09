import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import { snapshotSponsors } from "@/lib/data";

// Manual backup trigger for the daily sponsor snapshot (11.4).
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // default action below
  }

  if (body.action && body.action !== "snapshot") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const result = await snapshotSponsors();
  return NextResponse.json({ ok: true, manual: true, ...result });
}