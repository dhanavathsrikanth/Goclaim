"use client";

import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  listingName: string;
  displayUrl: string;
  listingPath: string;
  onClose: () => void;
};

export default function ShareListingModal({
  isOpen,
  listingName,
  displayUrl,
  listingPath,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCopied(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://goclaim.space";
  const pagePath = listingPath.startsWith("/") ? listingPath : `/${listingPath}`;
  // UTM-tagged share links: buyer's own shares show up as
  // utm_source=x / copy in their dashboard UTM breakdown.
  const xUrl = `${origin}${pagePath}?utm_source=x&utm_medium=share&utm_campaign=launch`;
  const copyUrl = `${origin}${pagePath}?utm_source=copy&utm_medium=share&utm_campaign=launch`;
  const tweetText = `I just claimed ${listingName} on Outbid for FREE — rank is what you pay. Claim yours before it's gone:`;
  const xIntent = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(xUrl)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = copyUrl;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-listing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[440px] rounded-3xl bg-card border border-border/80 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">
          🎉
        </div>
        <h2 id="share-listing-title" className="mt-3 text-center text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          You&apos;re live — FREE!
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">{listingName}</span>
          <span className="block truncate font-mono text-[11px] sm:text-xs mt-0.5">{displayUrl}</span>
          is now ranked at <span className="font-mono font-bold text-foreground">$2</span>.
          Paid bids outrank free — share it before someone outbids you.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={xIntent}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-full font-semibold text-sm bg-black text-white hover:bg-black/85 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-full font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? "Copied! ✓" : "Copy listing link"}
          </button>
          <a
            href={listingPath}
            className="w-full py-2.5 px-4 rounded-full font-medium text-sm text-foreground bg-transparent border border-border/80 hover:bg-muted/60 transition-colors text-center cursor-pointer"
          >
            View your listing →
          </a>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
          Free = starter rank. 1 free per domain · 1 per email.
          <br />
          Friends join free with your link — but only paid bids hold #1.
        </p>
      </div>
    </div>
  );
}
