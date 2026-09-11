import { NextRequest, NextResponse } from "next/server";
import { normalizeUrl, slugify, extractXHandle, extractDisplayUrl } from "@/lib/normalize";
import { validateBid } from "@/lib/validation";
import {
  getListingByNormalizedUrl,
  getListingBySlug,
  getListingById,
  upsertListing,
  upsertPayment,
  getListings,
  getBoardListings,
  getCoupon,
  consumeCoupon,
  hasEmailUsedCoupon,
  hasDomainUsedCoupon,
} from "@/lib/data";
import { getCurrentTopBid } from "@/lib/ranking";
import { createClaimToken } from "@/lib/claim";
import { processOutbidAlerts } from "@/lib/outbidAlerts";
import { processMilestoneSocialAlert } from "@/lib/socialBot";
import { CATEGORIES } from "@/lib/types";

function generateId(): string {
  return `lst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generatePaymentId(): string {
  return `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function uniqueSlug(normalizedUrl: string): Promise<string> {
  const base = slugify(normalizedUrl);
  if (!(await getListingBySlug(base))) return base;
  for (let i = 0; i < 3; i++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (!(await getListingBySlug(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, amount } = body;
    const rawCoupon = typeof body.coupon === "string" ? body.coupon.trim().toUpperCase() : "";
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    const rawCategory = typeof body.category === "string" ? body.category : "";
    const category =
      (CATEGORIES as readonly string[]).includes(rawCategory) && rawCategory !== "All"
        ? rawCategory
        : "Other";

    const bidAmount = parseInt(String(amount), 10);
    if (isNaN(bidAmount)) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const validation = await validateBid(url, bidAmount);
    if (!validation.ok) {
      const allListings = await getListings();
      const errorMessages: Record<string, string> = {
        INVALID_URL: "Please enter a valid URL or X handle.",
        URL_NOT_ALLOWED: "Chat and invite links can't be listed.",
        AMOUNT_TOO_LOW: "Minimum bid is $2.",
        AMOUNT_NOT_WHOLE: "Bid must be a whole dollar amount.",
        AMOUNT_TOO_HIGH: "Maximum bid is $999,999.",
        AMOUNT_BELOW_TOP_BID: "Your bid must be higher than your current total.",
        TOP_BID_INSUFFICIENT: `To take #1, you must bid at least $${(getCurrentTopBid(allListings) + 5).toLocaleString()}.`,
      };
      return NextResponse.json(
        { error: errorMessages[validation.error!] || "Invalid bid." },
        { status: 400 }
      );
    }

    // ---- FREE COUPON CLAIM (no Dodo, no invite chain) ----
    // Strict rules: new domains only, starter $2 only, 1 per domain, 1 per email.
    if (rawCoupon) {
      const couponErrors: Record<string, string> = {
        COUPON_INVALID: "That code doesn't exist. Check spelling.",
        COUPON_EXPIRED: "That code has expired.",
        COUPON_EXHAUSTED: "That code is fully claimed — no uses left.",
        COUPON_INACTIVE: "That code is no longer active.",
        COUPON_EMAIL_REQUIRED: "Email is required for free claims (1 per email).",
        COUPON_EMAIL_INVALID: "Enter a valid email for the free claim.",
        COUPON_EMAIL_USED: "This email already claimed a free listing.",
        COUPON_DOMAIN_USED: "This domain / handle already claimed a free listing.",
        COUPON_REBID_NOT_ALLOWED: "Free codes are for new listings only — this URL is already ranked. Raise it with a paid bid.",
        COUPON_STARTER_ONLY: "Free codes cover a $2 starter listing only. Paid bids take higher ranks.",
      };
      const couponFail = (code: string, status = 400) =>
        NextResponse.json(
          { error: couponErrors[code] || "Invalid coupon.", code },
          { status }
        );

      const coupon = await getCoupon(rawCoupon);
      if (!coupon) return couponFail("COUPON_INVALID", 404);
      if (!coupon.active) return couponFail("COUPON_INACTIVE");
      if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now())
        return couponFail("COUPON_EXPIRED");
      if (coupon.uses >= coupon.max_uses) return couponFail("COUPON_EXHAUSTED");

      if (!rawEmail) return couponFail("COUPON_EMAIL_REQUIRED");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail))
        return couponFail("COUPON_EMAIL_INVALID");

      // Starter-only: free covers exactly the coupon amount ($2).
      if (bidAmount !== coupon.amount || (validation.amountToPay || bidAmount) !== coupon.amount)
        return couponFail("COUPON_STARTER_ONLY");

      const normalizedForCoupon = normalizeUrl(url);
      const existingForCoupon = await getListingByNormalizedUrl(normalizedForCoupon);
      if (existingForCoupon && existingForCoupon.status === "confirmed")
        return couponFail("COUPON_REBID_NOT_ALLOWED");
      if (await hasDomainUsedCoupon(normalizedForCoupon))
        return couponFail("COUPON_DOMAIN_USED");
      if (await hasEmailUsedCoupon(rawEmail))
        return couponFail("COUPON_EMAIL_USED");

      // Atomic claim — loses race = exhausted.
      const claimed = await consumeCoupon(rawCoupon);
      if (!claimed) return couponFail("COUPON_EXHAUSTED");

      // Build / reuse listing, confirm instantly at $2 rank value.
      const xHandleC = extractXHandle(url) || extractXHandle(normalizedForCoupon);
      let listingIdC: string;
      let productNameC = "";
      let faviconUrlC = "";
      let slugC = "";
      const nowIso = new Date().toISOString();
      if (existingForCoupon) {
        listingIdC = existingForCoupon.id;
        productNameC = existingForCoupon.product_name;
        faviconUrlC = existingForCoupon.favicon_url;
        slugC = existingForCoupon.slug;
      } else {
        listingIdC = generateId();
        if (xHandleC) {
          productNameC = `@${xHandleC}`;
          faviconUrlC = "https://www.google.com/s2/favicons?domain=x.com&sz=64";
        } else {
          try {
            const parsed = new URL(
              normalizedForCoupon.startsWith("http") ? normalizedForCoupon : `https://${normalizedForCoupon}`
            );
            productNameC = parsed.hostname.replace("www.", "");
            faviconUrlC = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
          } catch {
            productNameC = normalizedForCoupon;
          }
        }
        slugC = await uniqueSlug(normalizedForCoupon);
      }

      const paymentIdC = generatePaymentId();
      const listingRow = {
        id: listingIdC,
        url: existingForCoupon
          ? existingForCoupon.url
          : xHandleC
            ? `https://x.com/${xHandleC}`
            : url.trim().startsWith("@")
              ? `https://x.com/${url.trim().slice(1).trim()}`
              : url.trim(),
        normalized_url: normalizedForCoupon,
        product_name: productNameC,
        description: existingForCoupon?.description ?? "",
        favicon_url: faviconUrlC,
        category,
        total_bid: coupon.amount,
        click_count: existingForCoupon?.click_count ?? 0,
        created_at: existingForCoupon?.created_at ?? nowIso,
        updated_at: nowIso,
        status: "confirmed" as const,
        claim_email: rawEmail,
        banner_url: existingForCoupon?.banner_url ?? "",
        logo_url: existingForCoupon?.logo_url ?? "",
        creative_approved: existingForCoupon?.creative_approved ?? false,
        slug: slugC,
      };
      await upsertListing(listingRow);
      await upsertPayment({
        id: paymentIdC,
        listing_id: listingIdC,
        checkout_session_id: `coupon_${rawCoupon}`,
        amount: coupon.amount,
        status: "confirmed",
        created_at: nowIso,
        coupon_code: rawCoupon,
      });

      // Feed activity / alerts (best-effort, never blocks claim).
      try {
        const fresh = await getListingById(listingIdC);
        if (fresh) {
          await processOutbidAlerts(fresh, 0).catch(() => {});
          const topBoard = await getBoardListings("all-time").catch(() => []);
          if (topBoard && topBoard.length > 0) {
            const newRank = topBoard.findIndex((l) => l.id === listingIdC) + 1;
            await processMilestoneSocialAlert(fresh, 999, newRank > 0 ? newRank : 999).catch(() => {});
          }
        }
      } catch {}

      let claimToken = "";
      try {
        claimToken = createClaimToken(rawEmail);
      } catch {}

      return NextResponse.json({
        free_claim: true,
        listing_id: listingIdC,
        slug: slugC,
        amount: coupon.amount,
        coupon: rawCoupon,
        claim_token: claimToken,
        listing_url: `/listings/${slugC}`,
        listing_name: productNameC,
        normalized_url: normalizedForCoupon,
        display_url: extractDisplayUrl(normalizedForCoupon),
      });
    }

    const normalizedUrl = normalizeUrl(url);
    const existingListing = await getListingByNormalizedUrl(normalizedUrl);
    const xHandle = extractXHandle(url) || extractXHandle(normalizedUrl);

    let listingId: string;
    let productName = "";
    let description = "";
    let faviconUrl = "";

    if (existingListing) {
      listingId = existingListing.id;
      productName = existingListing.product_name;
      description = existingListing.description;
      faviconUrl = existingListing.favicon_url;
    } else {
      listingId = generateId();
      if (xHandle) {
        productName = `@${xHandle}`;
        faviconUrl = "https://www.google.com/s2/favicons?domain=x.com&sz=64";
      } else {
        try {
          const parsed = new URL(
            normalizedUrl.startsWith("http") ? normalizedUrl : `https://${normalizedUrl}`
          );
          productName = parsed.hostname.replace("www.", "");
          faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        } catch {
          productName = normalizedUrl;
        }
      }
    }

    const paymentId = generatePaymentId();
    const amountToPay = validation.amountToPay || bidAmount;

    if (!existingListing) {
      const newListing = {
        id: listingId,
        url: xHandle ? `https://x.com/${xHandle}` : (url.trim().startsWith("@") ? `https://x.com/${url.trim().slice(1).trim()}` : url.trim()),
        normalized_url: normalizedUrl,
        product_name: productName,
        description,
        favicon_url: faviconUrl,
        category,
        total_bid: 0,
        click_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "pending" as const,
        claim_email: "",
        banner_url: "",
        logo_url: "",
        creative_approved: false,
        slug: await uniqueSlug(normalizedUrl),
      };
      await upsertListing(newListing);
    }

    const payment = {
      id: paymentId,
      listing_id: listingId,
      checkout_session_id: "",
      amount: amountToPay,
      status: "pending" as const,
      created_at: new Date().toISOString(),
    };
    await upsertPayment(payment);

    const API_KEY = process.env.DODO_PAYMENTS_API_KEY;
    const ENVIRONMENT = (process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode";
    const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3001";
    let RETURN_URL = process.env.DODO_PAYMENTS_RETURN_URL || origin;
    if (RETURN_URL === "http://localhost:3000" && origin.includes(":3001")) {
      RETURN_URL = origin;
    }

    const isPlaceholder = !API_KEY || API_KEY.startsWith("your_");

    // In local development without real Dodo keys, provide a simulated checkout
    if (isPlaceholder) {
      const returnUrl = `${RETURN_URL}/payment/success?listing=${encodeURIComponent(listingId)}&pay=${encodeURIComponent(paymentId)}&simulated=true`;
      return NextResponse.json({
        checkout_url: returnUrl,
        payment_id: paymentId,
        listing_id: listingId,
        amount: amountToPay,
        simulated: true,
      });
    }

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
        } else {
          const created = await client.products.create({
            name: "Leaderboard Bid",
            tax_category: "digital_products",
            price: {
              type: "one_time_price",
              currency: "USD",
              price: 200,
              discount: 0,
              purchasing_power_parity: false,
              pay_what_you_want: true,
            },
          });
          productId = created.product_id;
        }
      } catch (err) {
        console.error("Dodo product lookup/creation warning:", err);
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
        return_url: `${RETURN_URL}/payment/success?listing=${encodeURIComponent(listingId)}&pay=${encodeURIComponent(paymentId)}`,
        metadata: {
          listing_id: listingId,
          payment_id: paymentId,
          bid_amount: String(amountToPay),
          normalized_url: normalizedUrl,
        },
      });
    } catch (dodoErr: unknown) {
      const err = dodoErr as { message?: string; status?: number; error?: { message?: string; code?: string } };
      // If Dodo merchant account is pending live approval, allow dev flow to continue gracefully
      if (err?.error?.code === "MERCHANT_NOT_LIVE" && process.env.NODE_ENV !== "production") {
        console.warn("Dodo Live payments not enabled yet for merchant. Falling back to local simulated checkout for development testing.");
        const origin = req.headers.get("origin") || req.nextUrl.origin || "http://localhost:3001";
        const returnUrl = `${origin}/payment/success?listing=${encodeURIComponent(listingId)}&pay=${encodeURIComponent(paymentId)}&simulated=true`;
        return NextResponse.json({
          checkout_url: returnUrl,
          payment_id: paymentId,
          listing_id: listingId,
          amount: amountToPay,
          simulated: true,
          notice: "Live payments not enabled for merchant on Dodo dashboard. Simulated checkout used for dev testing.",
        });
      }
      throw dodoErr;
    }

    if (session.session_id) {
      payment.checkout_session_id = session.session_id;
      await upsertPayment(payment);
    }

    return NextResponse.json({
      checkout_url: session.checkout_url,
      payment_id: paymentId,
      listing_id: listingId,
      amount: amountToPay,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const err = error as { message?: string; status?: number; error?: { message?: string; code?: string } };
    const msg = err?.error?.message || err?.message || "Failed to create checkout session.";
    return NextResponse.json(
      { error: msg },
      { status: err?.status || 500 }
    );
  }
}
