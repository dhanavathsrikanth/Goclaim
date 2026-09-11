import { NextRequest, NextResponse } from "next/server";
import { getCoupon, getConfirmedListingCount } from "@/lib/data";
import { FOUNDING_FREE_LIMIT } from "@/lib/promo";

export const dynamic = "force-dynamic";

// Public promo status for scarcity UI. No sensitive data.
// ?code=XXX → single coupon status (legacy).
// no param → founding slots + EARLY100 summary (banner + form).
export async function GET(req: NextRequest) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").trim().toUpperCase();
  if (code) {
    const coupon = await getCoupon(code);
    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid code." }, { status: 404 });
    }
    const expired = coupon.expires_at
      ? new Date(coupon.expires_at).getTime() < Date.now()
      : false;
    const usesLeft = Math.max(0, coupon.max_uses - coupon.uses);
    return NextResponse.json({
      valid: coupon.active && !expired && usesLeft > 0,
      code: coupon.code,
      amount: coupon.amount,
      max_uses: coupon.max_uses,
      uses: coupon.uses,
      uses_left: usesLeft,
      active: coupon.active,
      expired,
    });
  }

  const [count, early] = await Promise.all([
    getConfirmedListingCount(),
    getCoupon("EARLY100"),
  ]);
  const foundingSlots = Math.max(0, FOUNDING_FREE_LIMIT - count);
  const earlyLeft = early ? Math.max(0, early.max_uses - early.uses) : 0;
  const earlyExpired = early?.expires_at
    ? new Date(early.expires_at).getTime() < Date.now()
    : true;
  return NextResponse.json({
    founding: {
      limit: FOUNDING_FREE_LIMIT,
      used: count,
      slots_left: foundingSlots,
    },
    coupon: early
      ? {
          code: early.code,
          valid: early.active && !earlyExpired && earlyLeft > 0,
          uses_left: earlyLeft,
          max_uses: early.max_uses,
        }
      : null,
  });
}
