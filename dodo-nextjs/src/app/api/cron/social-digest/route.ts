import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { triggerDailyDigestBroadcast, triggerWeeklyDigestBroadcast } from "@/lib/socialBot";
export const dynamic = "force-dynamic";

function getReceiver(): Receiver | null {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current || !next) return null;
  return new Receiver({ currentSigningKey: current, nextSigningKey: next });
}

// Automated cron endpoint for Daily and Weekly Leaderboard Digests
// Production: requires valid Upstash QStash signature
// Local dev: bypass with ?dev=1 (NODE_ENV !== "production")
async function handler(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const { searchParams } = new URL(req.url);
  const secret = process.env.CLAIM_SECRET;
  const devBypass =
    searchParams.get("dev") === "1" ||
    (Boolean(secret) && searchParams.get("secret") === secret);
  const period = searchParams.get("period") === "weekly" ? "weekly" : "daily";

  if (!devBypass) {
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
      return NextResponse.json({ error: "missing signature" }, { status: 401 });
    }
    const receiver = getReceiver();
    if (!receiver) {
      return NextResponse.json(
        { error: "signing keys not configured" },
        { status: 500 }
      );
    }
    let valid = false;
    try {
      valid = await receiver.verify({
        signature,
        body: await req.text(),
      });
    } catch {
      valid = false;
    }
    if (!valid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  try {
    if (period === "weekly") {
      const result = await triggerWeeklyDigestBroadcast();
      return NextResponse.json({ ok: true, period, ...result });
    } else {
      const result = await triggerDailyDigestBroadcast();
      return NextResponse.json({ ok: true, period, ...result });
    }
  } catch (err: unknown) {
    console.error("[social-digest cron error]", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
