import { NextRequest, NextResponse } from "next/server";
import { getCoupon } from "@/lib/data";

export const dynamic = "force-dynamic";

// Public coupon status for scarcity UI. No sensitive data.
export async function GET(req: NextRequest) {
  const code = (new URL(req.url).searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Code required." }, { status: 400 });
  }
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
