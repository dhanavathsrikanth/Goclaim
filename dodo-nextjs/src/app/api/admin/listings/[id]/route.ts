import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import { getListingById, upsertListing } from "@/lib/data";

// Owner: admin moderation + creative review. All actions require an admin session.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = body.action;
  if (action === "remove") {
    listing.status = "removed";
  } else if (action === "restore") {
    listing.status = "confirmed";
  } else if (action === "approve_creative") {
    listing.creative_approved = true;
  } else if (action === "reject_creative") {
    listing.creative_approved = false;
    listing.banner_url = "";
    listing.logo_url = "";
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  listing.updated_at = new Date().toISOString();
  await upsertListing(listing);
  return NextResponse.json({ listing });
}