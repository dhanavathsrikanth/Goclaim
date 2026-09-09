import { NextRequest, NextResponse } from "next/server";
import { getListingById, upsertListing, getClicksByDay } from "@/lib/data";
import { verifyClaimToken } from "@/lib/claim";

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

  const clean = (v: unknown): string | undefined => {
    if (v === undefined) return undefined;
    if (typeof v !== "string") return "";
    const t = v.trim();
    return /^https?:\/\/.{1,500}$/.test(t) ? t : "";
  };

  const banner = clean(body.banner_url);
  const logo = clean(body.logo_url);
  if (banner !== undefined) listing.banner_url = banner;
  if (logo !== undefined) listing.logo_url = logo;
  listing.updated_at = new Date().toISOString();
  await upsertListing(listing);

  return NextResponse.json({ listing });
}
