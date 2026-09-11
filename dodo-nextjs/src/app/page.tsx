"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import BidForm from "./components/BidForm";
import LeaderboardRow from "./components/LeaderboardRow";
import LeaderboardSponsorRow from "./components/LeaderboardSponsorRow";
import BoardSwitcher from "./components/BoardSwitcher";
import CategoryFilter from "./components/CategoryFilter";
import LogoWall from "./components/LogoWall";
import PromoBanner from "./components/PromoBanner";
import MilestoneStrip from "./components/MilestoneStrip";
import ActivityFeed from "./components/ActivityFeed";
import CategoryIcon from "./components/CategoryIcon";
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
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [topBid, setTopBid] = useState(0);
  const [topBidAll, setTopBidAll] = useState(0);
  const [category, setCategory] = useState("All");
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
      const res = await fetch(`/api/board?${params.toString()}`);
      const data = await res.json();
      setAllListings(data.listings ?? []);
      setTopBid(data.top_bid ?? 0);
      setTopBidAll(data.top_bid_all ?? data.top_bid ?? 0);
    } catch (err) {
      console.error("Failed to fetch board:", err);
    } finally {
      setLoading(false);
    }
  }, [board]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of allListings) {
      counts[l.category] = (counts[l.category] || 0) + 1;
    }
    return counts;
  }, [allListings]);

  const listings = useMemo(() => {
    if (!category || category === "All") return allListings;
    return allListings.filter((l) => l.category === category);
  }, [allListings, category]);

  const total = listings.length;
  const boardTotal = allListings.length;

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const q = search.get("board");
    if (q === "today" || q === "daily" || q === "all-time") setBoard(q);
    const cat = search.get("category");
    if (cat) setCategory(cat);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    try {
      const params = new URLSearchParams(window.location.search);
      if (cat === "All") {
        params.delete("category");
      } else {
        params.set("category", cat);
      }
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    } catch {}
  };

  const handleBoardChange = (b: BoardType) => {
    setBoard(b);
    try {
      const params = new URLSearchParams(window.location.search);
      if (b === "all-time") {
        params.delete("board");
      } else {
        params.set("board", b);
      }
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    } catch {}
  };

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
    const searchParams = new URLSearchParams(window.location.search);
    const raiseId = searchParams.get("raise");
    const requestedAmount = searchParams.get("amount");
    if (!raiseId) return;
    fetch(`/api/listing/${encodeURIComponent(raiseId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.listing) {
          const targetAmount = requestedAmount && Number(requestedAmount) > d.listing.total_bid
            ? requestedAmount
            : String(d.listing.total_bid + 1);
          setPrefill({
            url: d.listing.url,
            amount: targetAmount,
          });
          document.getElementById("claim")?.scrollIntoView({ behavior: "smooth" });
          const input = document.getElementById("identity");
          if (input) setTimeout(() => input.focus(), 300);
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



      {/* 1. Hero Claim Form & Heading at the very top */}
      <PromoBanner />
      <div className="mt-4 sm:mt-6">
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
          initialAmount={prefill?.amount}
        />
      </div>

      {/* 2. Board Switcher */}
      <div className="mt-6 sm:mt-8">
        <BoardSwitcher active={board} onChange={handleBoardChange} />
      </div>

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
        <CategoryFilter active={category} onChange={handleCategoryChange} counts={catCounts} totalCount={boardTotal} />
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
          <ol className="flex flex-col gap-2 sm:gap-2.5">
            {/* Pinned #0 Active Daily Sponsor Row */}
            {sponsorData?.sponsor && (
              <li key="daily-sponsor">
                <LeaderboardSponsorRow
                  sponsor={sponsorData.sponsor}
                  validUntil={sponsorData.valid_until}
                />
              </li>
            )}
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
                    isSelected={selectedTarget?.rank === rank}
                    source={
                      category && category !== "All"
                        ? `category_${category.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`
                        : board
                    }
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

      {sponsorData && sponsorData.top3.length > 0 && (
        <div className="mt-8">
          <LogoWall entries={sponsorData.top3} />
        </div>
      )}

      <ActivityFeed />

      {catStats.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold tracking-[-0.02em] text-muted-foreground mb-3">Category totals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {catStats.map((s) => (
              <button
                key={s.category}
                onClick={() => {
                  handleCategoryChange(s.category);
                  document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <CategoryIcon category={s.category} className="size-3.5" />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{s.category}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground tabular-nums shrink-0 ml-2">
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
                {boardTotal}
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
