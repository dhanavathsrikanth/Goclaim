import { NextRequest, NextResponse } from "next/server";
import { getListingById, upsertListing, getClicksByDay } from "@/lib/data";
import { verifyClaimToken } from "@/lib/claim";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clicksByDay = await getClicksByDay(id);

  return NextResponse.json({ listing, clicks_by_day: clicksByDay });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  listing.status = "removed";
  listing.updated_at = new Date().toISOString();
  await upsertListing(listing);

  return NextResponse.json({ ok: true });
}

// Owner-only: update creative URLs. Requires the claim token for the
// email that owns this listing.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = verifyClaimToken(
    typeof body.claim === "string" ? body.claim : ""
  );
  if (!email) {
    return NextResponse.json({ error: "Invalid claim token." }, { status: 401 });
  }

  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (listing.claim_email !== email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const cleanUrl = (v: unknown): string | undefined => {
    if (v === undefined) return undefined;
    if (typeof v !== "string") return "";
    const t = v.trim();
    return /^https?:\/\/.{1,500}$/.test(t) ? t : "";
  };

  const cleanText = (v: unknown, maxLen: number): string | undefined => {
    if (v === undefined) return undefined;
    if (typeof v !== "string") return "";
    return v.trim().slice(0, maxLen);
  };

  const banner = cleanUrl(body.banner_url);
  const logo = cleanUrl(body.logo_url);
  const demoUrl = cleanUrl(body.demo_url);
  const promoCode = cleanText(body.promo_code, 30);
  const promoOffer = cleanText(body.promo_offer, 100);
  const founderNote = cleanText(body.founder_note, 120);

  if (banner !== undefined) listing.banner_url = banner;
  if (logo !== undefined) listing.logo_url = logo;
  if (demoUrl !== undefined) listing.demo_url = demoUrl;
  if (promoCode !== undefined) listing.promo_code = promoCode;
  if (promoOffer !== undefined) listing.promo_offer = promoOffer;
  if (founderNote !== undefined) listing.founder_note = founderNote;

  listing.updated_at = new Date().toISOString();
  await upsertListing(listing);

  return NextResponse.json({ listing });
}
