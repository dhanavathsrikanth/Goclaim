"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type {
  Listing,
  Payment,
  DayClickCount,
  ReferralSourceBreakdown,
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
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-1">Your dashboard</h1>
          <p className="text-sm text-muted-foreground mb-8">{email}</p>

          {items.length === 0 ? (
            <p className="text-muted-foreground">No listings linked to this email yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const l = item.listing;
                const totalClicks = item.clicks_by_day.reduce(
                  (s, d) => s + d.clicks,
                  0
                );
                return (
                  <div
                    key={l.id}
                    className="rounded-xl bg-card border border-border p-5"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-foreground truncate">
                          {l.product_name || l.url}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {l.url} · {l.category} · {l.status}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-foreground tabular-nums">
                          ${l.total_bid.toLocaleString()}
                        </p>
                        <Link
                          href={`/?raise=${l.id}`}
                          className="inline-block mt-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
                        >
                          Raise bid
                        </Link>
                      </div>
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Clicks</p>
                        <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">{l.click_count.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{totalClicks} in 30d window</p>
                      </div>

                      <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Effective CPC</p>
                        <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
                          {l.click_count > 0 ? `$${(l.total_bid / l.click_count).toFixed(2)}` : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">per tracked click</p>
                      </div>

                      <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ranks (All / 24h / UTC)</p>
                        <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
                          #{item.ranks["all-time"] ?? "—"} <span className="text-xs text-muted-foreground font-normal">/ #{item.ranks["today"] ?? "—"} / #{item.ranks["daily"] ?? "—"}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">All-Time · Today · Daily</p>
                      </div>

                      <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Destination</p>
                        <a
                          href={`/api/go/${l.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline truncate block mt-1"
                          title="Test your live tracked redirect link"
                        >
                          {l.url.includes("x.com") || l.url.includes("twitter.com") || l.url.startsWith("@")
                            ? `𝕏 @${l.url.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, "").replace(/^@/, "").replace(/\/+$/, "")}`
                            : l.url.replace(/^https?:\/\//, "").replace(/\/+$/, "")} ↗
                        </a>
                        <p className="text-[10px] text-muted-foreground mt-0.5">verified redirect</p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs flex items-center gap-2">
                      {item.ad_live ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          👑 Sponsor slot LIVE on homepage until 00:00 UTC
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          👑 Homepage Sponsor slot: outbid #1 before midnight UTC to take the crown.
                        </span>
                      )}
                    </div>

                    {/* Private Analytics & ROI Calculator Section */}
                    <div className="mt-5 space-y-4">
                      <RoiCalculatorCard
                        listingId={l.id}
                        productName={l.product_name || l.url}
                        totalBid={l.total_bid}
                        clickCount={l.click_count}
                        initialRoi={item.roi}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <ClickTimelineChart data={item.clicks_by_day} />
                        <ReferralBreakdownCard
                          breakdown={item.referral_breakdown}
                          totalClicks={l.click_count}
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
                                ${p.amount} · {p.status}
                              </span>
                              <span className="tabular-nums">
                                {new Date(p.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <CreativeForm
                      listing={l}
                      claim={claim}
                      onSaved={() => load(claim)}
                    />
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