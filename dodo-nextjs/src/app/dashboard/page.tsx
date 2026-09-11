"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type {
  Listing,
  Payment,
  DayClickCount,
  ReferralSourceBreakdown,
  UtmBreakdown,
  RoiMetrics,
} from "@/lib/types";
import RoiCalculatorCard from "../components/RoiCalculatorCard";
import ClickTimelineChart from "../components/ClickTimelineChart";
import ReferralBreakdownCard from "../components/ReferralBreakdownCard";

type DashboardItem = {
  listing: Listing;
  ranks: Record<string, number | null>;
  clicks_by_day: DayClickCount[];
  referral_breakdown: ReferralSourceBreakdown[];
  utm_breakdown: UtmBreakdown[];
  roi?: RoiMetrics;
  payments: Payment[];
  ad_live: boolean;
  ad_valid_until: string;
};

const BOARD_LABELS: Record<string, string> = {
  "all-time": "All-time",
  today: "Today",
  daily: "Daily",
};

function RankChip({ label, value }: { label: string; value: number | null }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
        value === 1
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted/60 text-muted-foreground"
      }`}
    >
      {label} {value ? `#${value}` : "—"}
    </span>
  );
}

function CreativeForm({
  listing,
  claim,
  onSaved,
}: {
  listing: Listing;
  claim: string;
  onSaved: () => void;
}) {
  const [banner, setBanner] = useState(listing.banner_url || "");
  const [logo, setLogo] = useState(listing.logo_url || "");
  const [demoUrl, setDemoUrl] = useState(listing.demo_url || "");
  const [promoCode, setPromoCode] = useState(listing.promo_code || "");
  const [promoOffer, setPromoOffer] = useState(listing.promo_offer || "");
  const [founderNote, setFounderNote] = useState(listing.founder_note || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/listing/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim,
          banner_url: banner,
          logo_url: logo,
          demo_url: demoUrl,
          promo_code: promoCode,
          promo_offer: promoOffer,
          founder_note: founderNote,
        }),
      });
      if (!res.ok) {
        setMsg("Couldn't save — check the inputs and try again.");
      } else {
        setMsg("Saved successfully!");
        onSaved();
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4">
      {/* Rich Profile Enhancements */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
          ✨ Founder Conversion Enhancements
        </h4>
        <p className="text-[11px] text-muted-foreground mb-3">
          Give visitors more reasons to click, watch your demo, and use your discount codes.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Founder One-Liner / Changelog Note (Viral badge on card &amp; listing)
            </label>
            <input
              value={founderNote}
              onChange={(e) => setFounderNote(e.target.value)}
              placeholder="e.g. 🚀 Just launched v2.0 with Claude 3.7 support!"
              maxLength={120}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Custom Promo / Discount Code
              </label>
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="e.g. GOCLAIM"
                maxLength={30}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Discount Offer Description
              </label>
              <input
                value={promoOffer}
                onChange={(e) => setPromoOffer(e.target.value)}
                placeholder="e.g. Use code GOCLAIM for 20% off"
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Video / Loom / GIF Demo Embed URL
            </label>
            <input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>
        </div>
      </div>

      {/* Sponsor creatives */}
      <div className="pt-2 border-t border-border/60">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Sponsor Creatives (shown on hero ad slot if you win #1)
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            placeholder="Banner image URL (https://…)"
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
          />
          <input
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="Logo image URL (https://…)"
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {saving ? "Saving…" : "Save Listing Enhancements"}
        </button>
        {msg && <span className="text-xs font-medium text-foreground">{msg}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [claim, setClaim] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "invalid">("loading");

  const load = useCallback(async (token: string) => {
    setState("loading");
    try {
      const res = await fetch(
        `/api/dashboard?claim=${encodeURIComponent(token)}`
      );
      if (res.status === 401) {
        setState("invalid");
        return;
      }
      const data = await res.json();
      setEmail(data.email || "");
      setItems(data.listings || []);
      setState("ready");
    } catch {
      setState("invalid");
    }
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("claim") ?? "";
    setClaim(token);
    if (!token) {
      setState("invalid");
      return;
    }
    load(token);
  }, [load]);

  if (state === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Invalid dashboard link
            </h1>
            <p className="text-muted-foreground mb-8">
              This link is missing or broken. Your personal dashboard link was
              shown right after payment — check your history or pay again to
              get a fresh one.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-muted border border-border text-foreground font-medium"
            >
              ← Back to the board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-8 sm:pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Your dashboard</h1>
          <p className="text-sm text-muted-foreground mb-8">{email}</p>

          {items.length === 0 ? (
            <p className="text-muted-foreground">No listings linked to this email yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const l = item.listing;
                return (
                  <div
                    key={l.id}
                    className="rounded-xl bg-card border border-border p-4 sm:p-5"
                  >
                    {/* Header: identity + rank + action */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base sm:text-lg font-semibold text-foreground truncate">
                            {l.product_name || l.url}
                          </p>
                          {l.claimed_free ? (
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-600 shrink-0">
                              FREE
                            </span>
                          ) : (
                            <span className="font-mono font-bold text-foreground tabular-nums text-sm sm:text-base shrink-0">
                              ${l.total_bid.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          <a
                            href={`/api/go/${l.id}?from=dashboard`}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="hover:text-primary hover:underline"
                            title="Test your live tracked link"
                          >
                            {l.url}
                          </a>{" "}
                          · {l.category}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <RankChip label="All" value={item.ranks["all-time"]} />
                          <RankChip label="24h" value={item.ranks["today"]} />
                          <RankChip label="Daily" value={item.ranks["daily"]} />
                          {item.ad_live && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                              👑 Ad LIVE till 00:00 UTC
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/?raise=${l.id}`}
                        className="inline-block text-center shrink-0 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors w-full sm:w-auto"
                      >
                        Raise bid
                      </Link>
                    </div>

                    {/* Private Analytics & ROI Calculator Section */}
                    <div className="mt-5 space-y-4">
                      <RoiCalculatorCard
                        listingId={l.id}
                        productName={l.product_name || l.url}
                        totalBid={l.claimed_free ? 0 : l.total_bid}
                        clickCount={l.click_count}
                        initialRoi={item.roi}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <ClickTimelineChart data={item.clicks_by_day} />
                        <ReferralBreakdownCard
                          breakdown={item.referral_breakdown}
                          totalClicks={l.click_count}
                          utm={item.utm_breakdown || []}
                          listingSlug={l.slug || l.id}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Payments ({item.payments.length})
                      </p>
                      {item.payments.length === 0 ? (
                        <p className="text-xs text-muted-foreground">None.</p>
                      ) : (
                        <div className="space-y-1">
                          {item.payments.map((p) => (
                            <div
                              key={p.id}
                              className="flex justify-between text-xs text-muted-foreground"
                            >
                              <span className="tabular-nums">
                                {p.coupon_code ? (
                                  <span className="font-bold text-emerald-600">FREE</span>
                                ) : (
                                  <>${p.amount}</>
                                )}{" "}
                                · {p.status}
                                {p.coupon_code ? ` · ${p.coupon_code}` : ""}
                              </span>
                              <span className="tabular-nums">
                                {new Date(p.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <details className="mt-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
                      <summary className="cursor-pointer text-xs font-bold text-foreground select-none">
                        ✨ Listing enhancements <span className="font-normal text-muted-foreground">— logo, demo, promo code, founder note</span>
                      </summary>
                      <CreativeForm
                        listing={l}
                        claim={claim}
                        onSaved={() => load(claim)}
                      />
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}