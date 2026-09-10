import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { snapshotSponsors, getActiveSponsor, getListingById } from "@/lib/data";
import { announceDailyChampion } from "@/lib/composio";
import { triggerDailyDigestBroadcast } from "@/lib/socialBot";
export const dynamic = "force-dynamic";

function getReceiver(): Receiver | null {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!current || !next) return null;
  return new Receiver({ currentSigningKey: current, nextSigningKey: next });
}

// Runs the daily 00:00 UTC sponsor snapshot.
// Production: requires a valid QStash signature (Upstash-Signature header).
// Local dev: bypass with ?dev=1 (NODE_ENV !== "production" only),
// since QStash cannot reach localhost.
async function handler(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const devBypass =
    isDev && new URL(req.url).searchParams.get("dev") === "1";

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

  const result = await snapshotSponsors();

  let social = null;
  let digest = null;
  try {
    const active = await getActiveSponsor();
    if (active && active.entries.length > 0) {
      const topWinner = active.entries[0];
      const listing = await getListingById(topWinner.listing_id);
      social = await announceDailyChampion({
        product_name: topWinner.product_name,
        total_bid: topWinner.total_bid,
        slug: listing?.slug,
        url: topWinner.url,
      });
    }
  } catch (err) {
    console.error("Failed to announce daily champion to social:", err);
  }

  try {
    digest = await triggerDailyDigestBroadcast();
  } catch (err) {
    console.error("Failed to trigger daily digest to social:", err);
  }

  return NextResponse.json({ ok: true, ...result, social, digest });
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}