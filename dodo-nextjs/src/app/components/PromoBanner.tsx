"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PromoData = {
  founding: { limit: number; used: number; slots_left: number };
  coupon: { code: string; valid: boolean; uses_left: number; max_uses: number } | null;
};

export default function PromoBanner() {
  const [promo, setPromo] = useState<PromoData | null>(null);

  useEffect(() => {
    fetch("/api/coupon")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.founding) setPromo(d);
      })
      .catch(() => {});
  }, []);

  if (!promo) return null;

  const scrollToClaim = () => {
    document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" });
  };

  if (promo.founding.slots_left > 0) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-foreground">
          🎉 Launch offer: the first {promo.founding.limit} listings are{" "}
          <span className="text-emerald-600">FREE</span> — {promo.founding.slots_left} left
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={scrollToClaim}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            Claim yours now →
          </button>
          <Link
            href="/rules"
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Details in Rules
          </Link>
        </div>
      </div>
    );
  }

  if (promo.coupon?.valid) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-foreground">
          🔥 Code <span className="font-mono">{promo.coupon.code}</span>:{" "}
          {promo.coupon.uses_left}/{promo.coupon.max_uses} free claims left
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={scrollToClaim}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors cursor-pointer"
          >
            Claim FREE →
          </button>
          <Link
            href="/rules"
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Details in Rules
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
