"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Listing, Payment } from "@/lib/types";

type DayCount = { day: string; clicks: number };

type DashboardItem = {
  listing: Listing;
  ranks: Record<string, number | null>;
  clicks_by_day: DayCount[];
  payments: Payment[];
  ad_live: boolean;
  ad_valid_until: string;
};

const BOARD_LABELS: Record<string, string> = {
  "all-time": "All-time",
  today: "Today",
  daily: "Daily",
};

function ClickChart({ data }: { data: DayCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.clicks));
  const last14 = data.slice(-14);
  return (
    <div>
      <div className="flex items-end gap-1 h-20">
        {last14.length === 0 ? (
          <p className="text-xs text-muted-foreground self-center">No clicks yet.</p>
        ) : (
          last14.map((d) => (
            <div
              key={d.day}
              title={`${d.day}: ${d.clicks} clicks`}
              className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors min-w-2"
              style={{ height: `${Math.max(4, (d.clicks / max) * 100)}%` }}
            />
          ))
        )}
      </div>
      {last14.length > 0 && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">{last14[0].day.slice(5)}</span>
          <span className="text-[10px] text-muted-foreground">
            {last14[last14.length - 1].day.slice(5)}
          </span>
        </div>
      )}
    </div>
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
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/listing/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, banner_url: banner, logo_url: logo }),
      });
      if (!res.ok) {
        setMsg("Couldn't save — check the URLs and try again.");
      } else {
        setMsg("Saved.");
        onSaved();
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        Sponsor creatives (shown on the ad slot if you win — after admin approval)
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
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg bg-muted text-sm text-foreground hover:bg-muted/70 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save creatives"}
        </button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [claim, setClaim] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "invalid">("loading");

  useEffect(() => {
    setClaim(new URLSearchParams(window.location.search).get("claim") ?? "");
  }, []);

  const load = useCallback(async (token: string) => {
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
    if (!claim) {
      setState("invalid");
      return;
    }
    load(claim);
  }, [claim, load]);

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

                    <div className="flex gap-4 mt-4 flex-wrap">
                      {Object.entries(BOARD_LABELS).map(([board, label]) => (
                        <div key={board} className="text-sm">
                          <span className="text-muted-foreground">{label}: </span>
                          <span className="text-foreground font-medium tabular-nums">
                            {item.ranks[board] != null
                              ? `#${item.ranks[board]}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Clicks: </span>
                        <span className="text-foreground font-medium tabular-nums">
                          {l.click_count} ({totalClicks} tracked)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      {item.ad_live ? (
                        <span className="text-amber-300">
                          👑 Sponsor slot LIVE until 00:00 UTC
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sponsor slot: win #1 before midnight UTC to go live.
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Clicks per day (last 14 days with activity window)
                      </p>
                      <ClickChart data={item.clicks_by_day} />
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