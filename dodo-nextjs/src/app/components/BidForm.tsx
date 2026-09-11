"use client";
import { useState, useEffect } from "react";
import { CATEGORIES, Listing } from "@/lib/types";
import { isValidUrlOrDomain, extractFaviconDomain, normalizeUrl } from "@/lib/normalize";
import ConfirmRankModal from "./ConfirmRankModal";
import ShareListingModal from "./ShareListingModal";
import CategoryIcon from "./CategoryIcon";

type TargetInfo = {
  rank: number;
  price: number;
  name: string;
};

type BidFormProps = {
  topBid: number;
  listings?: Listing[];
  hoveredTarget?: TargetInfo | null;
  selectedTarget?: TargetInfo | null;
  onClearTarget?: () => void;
  onBidSubmitted?: () => void;
  initialUrl?: string;
  initialAmount?: string;
};

export default function BidForm({
  topBid,
  listings,
  hoveredTarget,
  selectedTarget,
  onClearTarget,
  onBidSubmitted,
  initialUrl,
  initialAmount,
}: BidFormProps) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [email, setEmail] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareInfo, setShareInfo] = useState<{ name: string; displayUrl: string; path: string } | null>(null);
  const [couponStatus, setCouponStatus] = useState<{
    valid: boolean;
    uses_left: number;
    max_uses: number;
  } | null>(null);

  // Live scarcity lookup: debounce while typing the code.
  useEffect(() => {
    const code = coupon.trim().toUpperCase();
    if (!showCoupon || code.length < 3) {
      setCouponStatus(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/coupon?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (res.ok) {
          setCouponStatus({
            valid: !!data.valid,
            uses_left: data.uses_left ?? 0,
            max_uses: data.max_uses ?? 0,
          });
        } else {
          setCouponStatus(null);
        }
      } catch {
        // ignore — checkout API is source of truth
      }
    }, 400);
    return () => clearTimeout(t);
  }, [coupon, showCoupon]);

  const faviconDomain = extractFaviconDomain(url);
  const liveFaviconUrl = faviconDomain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(faviconDomain)}&sz=64`
    : null;
  const [faviconLoaded, setFaviconLoaded] = useState(false);
  const [lastDomain, setLastDomain] = useState<string | null>(null);

  if (faviconDomain !== lastDomain) {
    setLastDomain(faviconDomain);
    setFaviconLoaded(false);
  }

  const minBid = 2;
  const topBidPlus5 = topBid + 5;
  const couponCode = coupon.trim().toUpperCase();
  const isFreeClaim = showCoupon && couponCode.length > 0;

  const activeTarget = selectedTarget || hoveredTarget || null;
  const targetRank = activeTarget ? activeTarget.rank : 1;
  // Free coupon always claims a $2 starter (joins board, doesn't snipe #1).
  const targetPrice = isFreeClaim
    ? minBid
    : activeTarget
    ? activeTarget.price
    : initialAmount && !isNaN(Number(initialAmount)) && Number(initialAmount) > 0
    ? Number(initialAmount)
    : topBid === 0
    ? minBid
    : topBidPlus5;

  const existingListing = listings?.find(
    (l) => (faviconDomain && l.normalized_url.includes(faviconDomain)) || l.url === url.trim()
  );
  const diffToPay = existingListing && targetPrice > existingListing.total_bid
    ? targetPrice - existingListing.total_bid
    : targetPrice;

  const confirmDisplayUrl = (() => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    try {
      return normalizeUrl(trimmed);
    } catch {
      return trimmed;
    }
  })();

  function handleInputFocus() {
    if (!selectedTarget && hoveredTarget) {
      onClearTarget?.();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL or X handle.");
      return;
    }

    if (!isValidUrlOrDomain(trimmedUrl)) {
      setError(
        trimmedUrl.startsWith("@")
          ? "Please enter a valid X handle (1–15 letters, numbers, or underscores)."
          : "Please enter a valid domain (e.g. yourproduct.com) or URL."
      );
      return;
    }

    if (isFreeClaim && !email.trim()) {
      setError("Email is required for free claims (1 free per email).");
      return;
    }

    if (isFreeClaim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email for the free claim.");
      return;
    }

    // Open confirmation dialog
    setModalError(null);
    setModalOpen(true);
  }

  async function handleConfirmCheckout() {
    setLoading(true);
    setModalError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          amount: targetPrice,
          category: category === "All" ? "Other" : category,
          ...(isFreeClaim
            ? { coupon: couponCode, email: email.trim().toLowerCase() }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error || "Something went wrong.");
        return;
      }

      // Free coupon claim → no redirect. Show share popup instantly.
      if (data.free_claim) {
        setModalOpen(false);
        setShareInfo({
          name: data.listing_name || url.trim(),
          displayUrl: data.display_url || data.normalized_url || url.trim(),
          path: data.listing_url || "/",
        });
        setShareOpen(true);
        setCoupon("");
        setEmail("");
        setShowCoupon(false);
        onBidSubmitted?.();
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
      onBidSubmitted?.();
    } catch {
      setModalError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="claim" className="scroll-mt-6">
      <h2 className="mx-auto max-w-4xl text-center text-[28px] font-semibold tracking-[-0.03em] text-pretty md:text-[40px] transition-all">
        {isFreeClaim ? (
          <>
            Claim your spot for{" "}
            <span className="font-mono tabular-nums font-bold text-emerald-600">$0</span>
          </>
        ) : (
          <>
            Claim #{targetRank} for{" "}
            <span className="font-mono tabular-nums font-bold text-foreground">
              ${targetPrice.toLocaleString()}
            </span>
          </>
        )}
      </h2>

      {activeTarget && activeTarget.rank > 1 && (
        <div className="mt-2 text-center animate-in fade-in duration-150">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            <span>🎯</span> Claiming spot #{activeTarget.rank} · Outbids {activeTarget.name}
            {selectedTarget && (
              <button
                type="button"
                onClick={onClearTarget}
                className="ml-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer underline"
              >
                (Reset to #1)
              </button>
            )}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto mt-3 flex w-full max-w-4xl flex-col gap-3">
        <div className="mx-auto flex w-[90%] flex-col gap-2.5 md:w-full md:flex-row md:gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center">
              {liveFaviconUrl ? (
                <>
                  {!faviconLoaded && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="size-4 text-muted-foreground transition-opacity"
                    >
                      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" strokeLinecap="round" />
                      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" strokeLinecap="round" />
                    </svg>
                  )}
                  <img
                    key={liveFaviconUrl}
                    src={liveFaviconUrl}
                    alt=""
                    onLoad={() => setFaviconLoaded(true)}
                    onError={() => setFaviconLoaded(false)}
                    className={`size-5 rounded-md object-contain transition-all duration-200 ${
                      faviconLoaded ? "opacity-100 scale-100" : "opacity-0 scale-75 absolute"
                    }`}
                  />
                </>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="size-4 text-muted-foreground"
                >
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" strokeLinecap="round" />
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <label htmlFor="identity" className="sr-only">
              Your product URL or @handle
            </label>
            <input
              id="identity"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="Your product URL or @handle"
              className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-card"
            />
          </div>
          <label htmlFor="bid-category" className="sr-only">
            Choose a category
          </label>
          <div className="relative w-full md:w-56">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
              <CategoryIcon category={category} className="size-4 shrink-0" />
            </div>
            <select
              id="bid-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full cursor-pointer rounded-xl border border-input bg-white pl-9 pr-8 text-[13px] text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-card appearance-none font-medium truncate"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 md:w-auto cursor-pointer shrink-0"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing
              </span>
            ) : isFreeClaim ? (
              "Claim Free Starter"
            ) : existingListing && diffToPay < targetPrice ? (
              `Reclaim #${targetRank} · Pay $${diffToPay.toLocaleString()} diff`
            ) : (
              `Claim #${targetRank} for $${targetPrice.toLocaleString()}`
            )}
          </button>
        </div>

        {error && <p className="mx-auto text-sm text-red-600">{error}</p>}

        <div className="mx-auto w-[90%] md:w-full max-w-4xl">
          {!showCoupon ? (
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              className="mx-auto block text-xs font-medium text-primary hover:text-primary/80 cursor-pointer"
            >
              Have a code? Claim FREE →
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code (e.g. EARLY100)"
                  aria-label="Coupon code"
                  className="h-10 flex-1 rounded-lg border border-input bg-white px-3 font-mono text-sm uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:tracking-normal focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-card"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for free claim"
                  aria-label="Email for free claim"
                  className="h-10 flex-1 rounded-lg border border-input bg-white px-3 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-card"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCoupon(false);
                    setCoupon("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer shrink-0 px-1"
                >
                  Remove
                </button>
              </div>
              {couponStatus && (
                <p className="text-center text-[11px] font-medium tabular-nums">
                  {couponStatus.valid ? (
                    <span className="text-emerald-600">
                      {couponStatus.uses_left}/{couponStatus.max_uses} free claims left — hurry 🔥
                    </span>
                  ) : (
                    <span className="text-red-500">
                      Code exhausted or expired — try a paid bid.
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="mx-auto text-center text-xs text-muted-foreground">
          {isFreeClaim
            ? "Free code covers a $2 starter rank. 1 per domain · 1 per email · new listings only."
            : activeTarget && activeTarget.rank > 1
            ? `Outbidding ${activeTarget.name} to take spot #${activeTarget.rank}. Fixed at $${targetPrice.toLocaleString()}.`
            : topBid > 0
            ? `Current #1 is $${topBid.toLocaleString()}. Claim #1 for $${topBidPlus5.toLocaleString()}.`
            : `Minimum bid: $${minBid}. Whole dollars only.`}
        </p>
      </form>

      <ConfirmRankModal
        isOpen={modalOpen}
        onClose={() => {
          if (!loading) setModalOpen(false);
        }}
        onConfirm={handleConfirmCheckout}
        rank={targetRank}
        amount={targetPrice}
        diffAmount={diffToPay < targetPrice ? diffToPay : undefined}
        category={category}
        loading={loading}
        error={modalError}
        displayUrl={confirmDisplayUrl}
        coupon={isFreeClaim ? couponCode : ""}
        isFree={isFreeClaim}
      />
      {shareInfo && (
        <ShareListingModal
          isOpen={shareOpen}
          listingName={shareInfo.name}
          displayUrl={shareInfo.displayUrl}
          listingPath={shareInfo.path}
          onClose={() => setShareOpen(false)}
        />
      )}
    </section>
  );
}
