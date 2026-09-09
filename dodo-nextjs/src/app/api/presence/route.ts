import { NextRequest, NextResponse } from "next/server";
import { getPresenceCount, touchPresence } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ viewers: await getPresenceCount() });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // fall through with empty body
  }
  const viewers = await touchPresence(
    typeof body.client_id === "string" ? body.client_id : "",
    typeof body.path === "string" ? body.path : ""
  );
  return NextResponse.json({ viewers });
}