"use client";
import { useState } from "react";

type Props = {
  pageUrl: string;
  productName: string;
  bid: number;
};

export default function ShareButtons({ pageUrl, productName, bid }: Props) {
  const [copied, setCopied] = useState(false);

  const text = `${productName} holds its rank on goclaim.space with a $${bid.toLocaleString()} bid. Outbid them.`;
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm font-medium text-center hover:border-neutral-600 transition-colors"
      >
        𝕏 Share rank
      </a>
      <button
        onClick={copy}
        className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm font-medium hover:border-neutral-600 transition-colors cursor-pointer"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}