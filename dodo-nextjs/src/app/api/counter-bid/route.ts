import { NextRequest, NextResponse } from "next/server";
import { getListingBySlug, getListingById, upsertPayment } from "@/lib/data";

function generatePaymentId(): string {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
  const searchParams = req.nextUrl.searchParams;
  const listingParam = searchParams.get("listing")?.trim();
  const requestedAmount = parseInt(searchParams.get("amount") || "0", 10);

  if (!listingParam) {
    return NextResponse.redirect(`${origin}/?board=all-time`, 307);
  }

  try {
    let listing = await getListingBySlug(listingParam);
    if (!listing) {
      listing = await getListingById(listingParam);
    }

    if (!listing) {
      return NextResponse.redirect(`${origin}/?board=all-time`, 307);
    }

    // Minimum counter-bid is +$1 over current bid
    const targetBid = requestedAmount > listing.total_bid
      ? requestedAmount
      : listing.total_bid + 1;

    const amountToPay = targetBid - listing.total_bid;

    if (amountToPay <= 0) {
      return NextResponse.redirect(`${origin}/?raise=${encodeURIComponent(listing.slug || listing.id)}`, 307);
    }

    const paymentId = generatePaymentId();
    await upsertPayment({
      id: paymentId,
      listing_id: listing.id,
      checkout_session_id: "",
      amount: amountToPay,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    const API_KEY = process.env.DODO_PAYMENTS_API_KEY;
    const ENVIRONMENT = (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode";
    const RETURN_URL = process.env.DODO_PAYMENTS_RETURN_URL || origin;

    const isPlaceholder = !API_KEY || API_KEY.startsWith("your_");

    // Simulated dev mode
    if (isPlaceholder) {
      const returnUrl = `${RETURN_URL}/payment/success?listing=${encodeURIComponent(listing.id)}&pay=${encodeURIComponent(paymentId)}&simulated=true`;
      return NextResponse.redirect(returnUrl, 307);
    }

    // Real Dodo Checkout Session
    const { default: DodoPayments } = await import("dodopayments");
    const client = new DodoPayments({
      bearerToken: API_KEY,
      environment: ENVIRONMENT,
    });

    let productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
    if (!productId) {
      try {
        const prods = await client.products.list();
        if (prods.items && prods.items.length > 0) {
          productId = prods.items[0].product_id;
        }
      } catch (err) {
        console.warn("Dodo product lookup warning:", err);
      }
    }

    let session;
    try {
      session = await client.checkoutSessions.create({
        product_cart: [
          {
            product_id: productId || "p_default",
            quantity: 1,
            amount: amountToPay * 100,
          },
        ],
        return_url: `${RETURN_URL}/payment/success?listing=${encodeURIComponent(listing.id)}&pay=${encodeURIComponent(paymentId)}`,
        metadata: {
          listing_id: listing.id,
          payment_id: paymentId,
          bid_amount: String(amountToPay),
          target_total_bid: String(targetBid),
          normalized_url: listing.normalized_url,
          is_counter_bid: "true",
        },
      });
    } catch (dodoErr: unknown) {
      const err = dodoErr as { error?: { code?: string } };
      if (err?.error?.code === "MERCHANT_NOT_LIVE" && process.env.NODE_ENV !== "production") {
        const returnUrl = `${origin}/payment/success?listing=${encodeURIComponent(listing.id)}&pay=${encodeURIComponent(paymentId)}&simulated=true`;
        return NextResponse.redirect(returnUrl, 307);
      }
      throw dodoErr;
    }

    if (session?.session_id) {
      await upsertPayment({
        id: paymentId,
        listing_id: listing.id,
        checkout_session_id: session.session_id,
        amount: amountToPay,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }

    if (session?.checkout_url) {
      return NextResponse.redirect(session.checkout_url, 307);
    }

    // Fallback to pre-filled homepage
    return NextResponse.redirect(`${origin}/?raise=${encodeURIComponent(listing.slug || listing.id)}&amount=${targetBid}`, 307);
  } catch (err) {
    console.error("Counter-bid 1-click checkout error:", err);
    return NextResponse.redirect(`${origin}/?raise=${encodeURIComponent(listingParam)}&amount=${requestedAmount || 1}`, 307);
  }
}
