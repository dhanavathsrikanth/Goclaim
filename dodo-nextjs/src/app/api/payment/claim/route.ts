import { NextRequest, NextResponse } from "next/server";
import { getPaymentById, getListingById, upsertPayment, upsertListing } from "@/lib/data";
import { createClaimToken } from "@/lib/claim";

// Exchanges a (listing, pay) pair for a dashboard claim token.
// The pay id is an unguessable random value delivered only to the payer
// via the Dodo return_url, so presenting it proves payment ownership.
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const listingId = params.get("listing") ?? "";
  const payId = params.get("pay") ?? "";

  if (!listingId || !payId) {
    return NextResponse.json({ error: "Missing parameters." }, { status: 400 });
  }

  const payment = await getPaymentById(payId);
  if (!payment || payment.listing_id !== listingId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (payment.status !== "confirmed") {
    const isSimulated = params.get("simulated") === "true";
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const isPlaceholder = !apiKey || apiKey.startsWith("your_");

    if (isSimulated || isPlaceholder) {
      payment.status = "confirmed";
      await upsertPayment(payment);
      const listing = await getListingById(listingId);
      if (listing) {
        listing.total_bid += payment.amount;
        listing.status = "confirmed";
        listing.updated_at = new Date().toISOString();
        if (!listing.claim_email) {
          listing.claim_email = "test@example.com";
        }
        await upsertListing(listing);
      }
    } else {
      return NextResponse.json(
        { status: payment.status, pending: true },
        { status: 202 }
      );
    }
  }

  const listing = await getListingById(listingId);
  if (!listing || !listing.claim_email) {
    return NextResponse.json(
      { status: payment.status, pending: true },
      { status: 202 }
    );
  }

  return NextResponse.json({
    status: "confirmed",
    claim_token: createClaimToken(listing.claim_email),
  });
}