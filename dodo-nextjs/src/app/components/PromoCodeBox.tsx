"use client";

import { useState } from "react";

interface PromoCodeBoxProps {
  promoCode: string;
  promoOffer?: string;
  productName?: string;
}

export default function PromoCodeBox({
  promoCode,
  promoOffer,
  productName,
}: PromoCodeBoxProps) {
  const [copied, setCopied] = useState(false);

  if (!promoCode || !promoCode.trim()) return null;

  const code = promoCode.trim();
  const offer = promoOffer?.trim() || "Exclusive community discount";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0 text-lg">
          🏷️
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Limited Offer
            </span>
            {productName && (
              <span className="text-[11px] text-muted-foreground">
                for {productName}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {offer}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <span className="font-mono text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-background border border-dashed border-primary/40 text-foreground tracking-wider select-all">
          {code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          {copied ? "Copied! ✓" : "Copy Code"}
        </button>
      </div>
    </div>
  );
}
