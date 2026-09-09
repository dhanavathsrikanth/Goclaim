import { NextRequest, NextResponse } from "next/server";
import { getListingById, upsertListing } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, product_name, description, category } = body;

    if (!listing_id) {
      return NextResponse.json({ error: "listing_id required" }, { status: 400 });
    }

    const listing = await getListingById(listing_id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (product_name) listing.product_name = product_name;
    if (description) listing.description = description;
    if (category) listing.category = category;
    listing.updated_at = new Date().toISOString();

    await upsertListing(listing);

    return NextResponse.json({ ok: true, listing });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
