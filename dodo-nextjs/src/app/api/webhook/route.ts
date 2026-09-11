import { NextRequest, NextResponse } from "next/server";
import {
  getListingById,
  getPaymentByCheckoutSession,
  upsertListing,
  upsertPayment,
  getBoardListings,
} from "@/lib/data";
import { announceTakeover } from "@/lib/composio";
import { verifyDodoWebhook, isLiveWebhookSecret } from "@/lib/dodoWebhook";
import { processOutbidAlerts } from "@/lib/outbidAlerts";
import { processMilestoneSocialAlert } from "@/lib/socialBot";
import { sendListingConfirmedEmail } from "@/lib/email";
import { createClaimToken } from "@/lib/claim";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ received: true });
    }

    // Authenticate the sender. Enforced only once a real webhook secret is
    // configured; with placeholder keys (dev), unsigned simulated webhooks
    // are accepted with a warning so local testing keeps working.
    const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    if (isLiveWebhookSecret(secret)) {
      const check = verifyDodoWebhook(
        rawBody,
        {
          id: req.headers.get("webhook-id") ?? "",
          timestamp: req.headers.get("webhook-timestamp") ?? "",
          signature: req.headers.get("webhook-signature") ?? "",
        },
        secret as string
      );
      if (!check.ok) {
        console.error("Webhook signature rejected:", check.reason);
        return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
      }
    } else {
      console.warn("Webhook received without signature verification (dev keys).");
    }

    const eventType = (body.event_type || body.type) as string | undefined;
    const payload = (body.data || body) as Record<string, unknown>;

    console.log("Webhook received:", eventType, JSON.stringify(payload).slice(0, 200));

    if (
      eventType === "payment.succeeded" ||
      eventType === "checkout.session.completed" ||
      eventType === "checkout.session.async_payment_succeeded"
    ) {
      const sessionId = (payload.checkout_session_id ||
        payload.session_id ||
        payload.id) as string | undefined;

      if (!sessionId) {
        console.error("No session ID in webhook payload");
        return NextResponse.json({ received: true });
      }

      const payment = await getPaymentByCheckoutSession(sessionId);

      if (!payment) {
        console.error("No payment found for session:", sessionId);
        return NextResponse.json({ received: true });
      }

      payment.status = "confirmed";
      await upsertPayment(payment);

      const listing = await getListingById(payment.listing_id);
      if (!listing) {
        console.error("No listing found for payment:", payment.listing_id);
        return NextResponse.json({ received: true });
      }

      const previousTotalBid = listing.total_bid;
      listing.total_bid += payment.amount;
      listing.status = "confirmed";
      listing.updated_at = new Date().toISOString();
      const customer =
        payload.customer as Record<string, unknown> | undefined;
      const customerEmail =
        payload.customer_email || customer?.email || payload.email || "";
      if (!listing.claim_email && typeof customerEmail === "string" && customerEmail.includes("@")) {
        listing.claim_email = customerEmail.trim().toLowerCase();
      }
      await upsertListing(listing);

      console.log(
        `Payment confirmed: $${payment.amount} for listing ${listing.id} (${listing.normalized_url}). New total: $${listing.total_bid}`
      );

      // Send Listing Confirmed & Dashboard Magic Link email to founder
      const claimEmail = listing.claim_email || (typeof customerEmail === "string" ? customerEmail.trim().toLowerCase() : "");
      if (claimEmail && claimEmail.includes("@")) {
        try {
          const topBoard = await getBoardListings("all-time");
          const rank = topBoard.findIndex((l) => l.id === listing.id) + 1 || 1;
          const token = createClaimToken(claimEmail);
          await sendListingConfirmedEmail({
            to: claimEmail,
            listing,
            rank,
            paidAmount: payment.amount,
            totalBid: listing.total_bid,
            claimToken: token,
            category: listing.category || "General",
          });
        } catch (mailErr) {
          console.warn("Listing confirmation email error:", mailErr);
        }
      }

      // Trigger Outbid Alerts to overtaken founders
      try {
        await processOutbidAlerts(listing, previousTotalBid);
      } catch (alertErr) {
        console.warn("Outbid alert processing warning:", alertErr);
      }

      // Trigger Composio takeover announcement and Automated Social Amplification (Milestone Tweet)
      try {
        const topBoard = await getBoardListings("all-time");
        if (topBoard.length > 0 && topBoard[0].id === listing.id) {
          const prevLead = topBoard[1]?.product_name;
          await announceTakeover(listing, prevLead);
        }

        const newRank = topBoard.findIndex((l) => l.id === listing.id) + 1;
        const previousRank =
          topBoard.filter((l) => l.id !== listing.id && l.total_bid >= previousTotalBid).length + 1;
        await processMilestoneSocialAlert(listing, previousRank, newRank);
      } catch (socialErr) {
        console.warn("Social amplification warning:", socialErr);
      }
    }

    if (eventType === "payment.failed" || eventType === "checkout.session.expired") {
      const sessionId = (payload.checkout_session_id ||
        payload.session_id ||
        payload.id) as string | undefined;

      if (sessionId) {
        const payment = await getPaymentByCheckoutSession(sessionId);
        if (payment) {
          payment.status = "failed";
          await upsertPayment(payment);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
