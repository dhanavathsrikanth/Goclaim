"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import BidForm from "./components/BidForm";
import LeaderboardRow from "./components/LeaderboardRow";
import BoardSwitcher from "./components/BoardSwitcher";
import CategoryFilter from "./components/CategoryFilter";
import SponsorBanner from "./components/SponsorBanner";
import LogoWall from "./components/LogoWall";
import MilestoneStrip from "./components/MilestoneStrip";
import ActivityFeed from "./components/ActivityFeed";
import type { Listing, BoardType, SponsorEntry } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";

type CategoryStat = { category: string; count: number; totalBid: number };

type TargetInfo = {
  rank: number;
  price: number;
  name: string;
};

type SponsorData = {
  sponsor: SponsorEntry | null;
  top3: SponsorEntry[];
  snapshot_date: string | null;
  valid_until: string;
};

export default function Home() {
  const [board, setBoard] = useState<BoardType>("all-time");
  const [listings, setListings] = useState<Listing[]>([]);
  const [topBid, setTopBid] = useState(0);
  const [topBidAll, setTopBidAll] = useState(0);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("All");
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  const [catStats, setCatStats] = useState<CategoryStat[]>([]);
  const [sponsorData, setSponsorData] = useState<SponsorData | null>(null);
  const [prefill, setPrefill] = useState<{ url: string; amount: string } | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<TargetInfo | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<TargetInfo | null>(null);
  const [viewers, setViewers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (board) params.set("board", board);
      if (category && category !== "All") params.set("category", category);
      const res = await fetch(`/api/board?${params.toString()}`);
      const data = await res.json();
      setListings(data.listings ?? []);
      setTopBid(data.top_bid ?? 0);
      setTopBidAll(data.top_bid_all ?? data.top_bid ?? 0);
      setTotal(data.total ?? 0);
      setCatCounts(data.categories || {});
    } catch (err) {
      console.error("Failed to fetch board:", err);
    } finally {
      setLoading(false);
    }
  }, [board, category]);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("board");
    if (q === "today" || q === "daily" || q === "all-time") setBoard(q);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  useEffect(() => {
    let id = "";
    try {
      id = localStorage.getItem("outbid_cid") || "";
      if (!id) {
        id = `c_${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem("outbid_cid", id);
      }
    } catch {
      id = `c_${Math.random().toString(36).slice(2, 12)}`;
    }
    const ping = () => {
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: id, path: "/" }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (typeof d?.viewers === "number") setViewers(d.viewers);
        })
        .catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setCatStats(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const raiseId = new URLSearchParams(window.location.search).get("raise");
    if (!raiseId) return;
    fetch(`/api/listing/${encodeURIComponent(raiseId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.listing) {
          setPrefill({
            url: d.listing.url,
            amount: String(d.listing.total_bid + 1),
          });
          document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchSponsor = () => {
      fetch("/api/sponsor")
        .then((r) => r.json())
        .then((d) => setSponsorData(d))
        .catch(() => {});
    };
    fetchSponsor();
    const interval = setInterval(fetchSponsor, 60000);
    return () => clearInterval(interval);
  }, []);

  const claimAmount = topBidAll > 0 ? topBidAll + 5 : 2;
  const revenue = listings.reduce((s, l) => s + (l.total_bid || 0), 0);
  const activeTarget = selectedTarget || hoveredTarget;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4">
      <h1 className="sr-only">goclaim.space</h1>

      {/* Top Banner on Hover / Spot Selection */}
      {activeTarget && (
        <aside
          role="region"
          aria-label="Claim Spot Banner"
          className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2 duration-150 border-b border-primary/20 bg-background/95 backdrop-blur-md shadow-md"
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <p className="truncate text-xs sm:text-sm font-medium text-foreground">
                Claim Spot <span className="font-bold text-primary font-mono">#{activeTarget.rank}</span> for{" "}
                <span className="font-bold font-mono text-foreground">${activeTarget.price.toLocaleString()}</span>
                {activeTarget.name && (
                  <span className="hidden sm:inline text-muted-foreground ml-1.5">
                    · Outbid <span className="font-medium text-foreground">{activeTarget.name}</span>
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedTarget(activeTarget);
                  document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" });
                  const input = document.getElementById("identity");
                  if (input) {
                    setTimeout(() => input.focus(), 350);
                  }
                }}
                className="rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              >
                Claim spot #{activeTarget.rank} →
              </button>
              {selectedTarget && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTarget(null);
                    setHoveredTarget(null);
                  }}
                  className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Reset to #1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      <div className="mt-2">
        <BoardSwitcher active={board} onChange={setBoard} />
      </div>

      <div className="mt-6">
        {sponsorData?.sponsor && (
          <SponsorBanner sponsor={sponsorData.sponsor} validUntil={sponsorData.valid_until} />
        )}
        <BidForm
          key={prefill ? `raise-${prefill.url}` : "default"}
          topBid={topBidAll}
          listings={listings}
          hoveredTarget={hoveredTarget}
          selectedTarget={selectedTarget}
          onClearTarget={() => {
            setSelectedTarget(null);
            setHoveredTarget(null);
          }}
          onBidSubmitted={fetchBoard}
          initialUrl={prefill?.url}
        />
      </div>

      {sponsorData && sponsorData.top3.length > 0 && (
        <div className="mt-6">
          <LogoWall entries={sponsorData.top3} />
        </div>
      )}

      <MilestoneStrip />

      <div className="mt-6 flex items-center justify-between px-1">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{total} listings</span>
          <span className="size-1 rounded-full bg-border" />
          <span>
            Top bid: <span className="font-mono font-semibold text-foreground tabular-nums">${topBid.toLocaleString()}</span>
          </span>
          {viewers !== null && viewers > 0 && (
            <>
              <span className="size-1 rounded-full bg-border" />
              <span className="tabular-nums">
                <span className="text-emerald-500">●</span> {viewers} viewing
              </span>
            </>
          )}
        </div>
        <Link href="/?board=today" className="hidden text-xs font-medium text-primary hover:text-primary/80 sm:block">
          Today&apos;s board →
        </Link>
      </div>

      <div id="leaderboard" className="mt-3 scroll-mt-6">
        <CategoryFilter active={category} onChange={setCategory} counts={catCounts} totalCount={total} />
      </div>

      <div className="mt-4 flex scroll-mt-6 flex-col gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted md:rounded-2xl" />
          ))
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-2">No listings yet</p>
            <p className="text-sm text-muted-foreground/70">Be the first to bid and claim #1.</p>
          </div>
        ) : (
          <ol className="flex flex-col">
            {listings.map((listing, i) => {
              const rank = i + 1;
              const spotClaimPrice = rank === 1 ? claimAmount : Math.max(2, listing.total_bid + 1);
              const targetInfo: TargetInfo = {
                rank,
                price: spotClaimPrice,
                name: listing.product_name || extractDisplayUrl(listing.normalized_url),
              };

              return (
                <li key={listing.id}>
                  <LeaderboardRow
                    listing={listing}
                    rank={rank}
                    claimAmount={claimAmount}
                    onHover={(hovering) => {
                      if (hovering) {
                        setHoveredTarget(targetInfo);
                      } else {
                        setHoveredTarget((prev) => (prev?.rank === rank ? null : prev));
                      }
                    }}
                    onSelectRank={() => {
                      setSelectedTarget(targetInfo);
                      document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" });
                      const input = document.getElementById("identity");
                      if (input) {
                        setTimeout(() => input.focus(), 350);
                      }
                    }}
                  />
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {listings.length > 3 && (
        <section className="-mx-4 px-4 py-2 md:mx-0 mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-[-0.02em]">
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Today&apos;s top ranking
              </span>
            </h2>
            <button
              onClick={() => setBoard("today")}
              className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer"
            >
              See all &gt;
            </button>
          </div>
          <ol className="flex flex-col gap-1.5 md:grid md:grid-cols-3 md:gap-3">
            {listings.slice(0, 3).map((l, i) => (
              <li key={l.id}>
                <div className="rounded-xl bg-primary/5 px-3 py-2 md:px-3.5 md:py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold tabular-nums text-primary">#{i + 1}</span>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{l.product_name}</p>
                    <p className="font-mono text-sm font-semibold tabular-nums">${l.total_bid.toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {l.category || "Other"} · {l.click_count.toLocaleString()} clicks
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <ActivityFeed />

      {catStats.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold tracking-[-0.02em] text-muted-foreground mb-3">Category totals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {catStats.map((s) => (
              <button
                key={s.category}
                onClick={() => setCategory(s.category)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-muted-foreground">{s.category}</span>
                <span className="text-xs font-mono font-medium tabular-nums">
                  {s.count} · ${s.totalBid.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="mt-12 flex w-full justify-center" aria-live="polite">
        <div className="flex w-full max-w-3xl flex-col gap-4 sm:flex-row sm:gap-6">
          <p className="text-base sm:text-lg text-muted-foreground sm:flex-1">
            Some stats about this{" "}
            <Link href="/about" className="font-medium text-primary hover:text-primary/80">
              simple side project
            </Link>{" "}
            — rank is what you pay, nothing else.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:w-[min(100%,24rem)]">
            <div className="rounded-2xl bg-card px-3 py-3 text-center shadow-[0_12px_50px_rgba(40,38,36,0.08)] border border-border/60">
              <p className="flex h-8 sm:h-9 justify-center font-mono text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
                ${revenue.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">in bids</p>
            </div>
            <div className="rounded-2xl bg-card px-3 py-3 text-center shadow-[0_12px_50px_rgba(40,38,36,0.08)] border border-border/60">
              <p className="flex h-8 sm:h-9 justify-center font-mono text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
                {total}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">products added</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 text-center pb-4">
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Rank is what you pay — nothing else. Whole dollars, $1 at a time, $2 minimum.
        </p>
      </div>
    </div>
  );
}
