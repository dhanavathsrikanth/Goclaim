"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CategoryIcon from "./CategoryIcon";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rank: number;
  amount: number;
  category: string;
  loading: boolean;
  error?: string | null;
};

export default function ConfirmRankModal({
  isOpen,
  onClose,
  onConfirm,
  rank,
  amount,
  category,
  loading,
  error,
}: Props) {
  const [agreed, setAgreed] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setAgreed(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-rank-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-[440px] rounded-3xl bg-card border border-border/80 p-6 sm:p-7 shadow-2xl transition-all animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-5 top-5 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Title and subtitle */}
        <h2 id="confirm-rank-title" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Confirm this rank
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed pr-6">
          Check the rank and price, then agree to the Terms of Service to continue.
        </p>

        {/* Rank & Price Summary Card */}
        <div className="mt-5 rounded-2xl bg-muted/60 border border-border/50 p-4 sm:p-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Rank
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight block mt-0.5">
              #{rank}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <CategoryIcon category={category || "Other"} className="size-3.5 text-primary shrink-0" />
              <span className="text-xs font-medium text-muted-foreground truncate">
                {category || "Other"}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Price
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight tabular-nums font-mono block mt-0.5">
              ${amount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground mt-1 block">
              Due now
            </span>
          </div>
        </div>

        {/* Explanatory description */}
        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed mt-4">
          A listing at that rank on the public board. It goes live when payment confirms. Someone else can claim a higher rank.
        </p>

        {/* Terms Checkbox Container */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-background/60 p-3.5 sm:p-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
              className="mt-0.5 size-4 sm:size-4.5 rounded border-border text-[#e57255] focus:ring-[#e57255] accent-[#e57255] cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-[13px] text-foreground leading-snug">
              I have read and agree to the{" "}
              <Link
                href="/rules"
                target="_blank"
                className="underline underline-offset-2 hover:text-[#e57255] font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{" "}
              of goclaim.space
            </span>
          </label>

          <div className="text-[11px] text-muted-foreground mt-2.5 pt-2 border-t border-border/40 flex items-center gap-2">
            <Link href="/rules" target="_blank" className="hover:underline hover:text-foreground">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/rules" target="_blank" className="hover:underline hover:text-foreground">
              Rules
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-3 text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!agreed || loading}
            className={`w-full py-3 px-4 rounded-full font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs ${
              agreed && !loading
                ? "bg-[#e57255] hover:bg-[#d15d40] text-white cursor-pointer"
                : "bg-[#e57255]/40 text-white/80 cursor-not-allowed opacity-70"
            }`}
          >
            {loading ? (
              <>
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Processing…</span>
              </>
            ) : (
              "Continue to checkout"
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-full font-medium text-sm text-foreground bg-transparent border border-border/80 hover:bg-muted/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
