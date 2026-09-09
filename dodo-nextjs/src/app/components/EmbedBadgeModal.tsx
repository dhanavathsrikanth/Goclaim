"use client";

import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  productName: string;
  category: string;
  rank: number;
};

export default function EmbedBadgeModal({
  isOpen,
  onClose,
  slug,
  productName,
  category,
  rank,
}: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [badgeType, setBadgeType] = useState<"rank" | "category">("rank");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const siteUrl = origin || "https://goclaim.space";
  const badgeUrl = `${siteUrl}/api/badge/${slug}?theme=${theme}${
    badgeType === "category" ? "&type=category" : ""
  }`;
  const targetPageUrl = `${siteUrl}/listings/${slug}`;

  const htmlCode = `<a href="${targetPageUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${productName} on Goclaim" /></a>`;
  const markdownCode = `[![${productName} on Goclaim](${badgeUrl})](${targetPageUrl})`;

  const handleCopy = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#1c1a18] border border-[#33302b] p-6 shadow-2xl text-foreground text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-base">🏆</span>
              <h2 id="modal-title" className="text-lg font-bold text-white tracking-tight">
                Embed Live Badge
              </h2>
            </div>
            <p className="text-xs text-[#a8a29e]">
              Display your real-time Goclaim ranking badge on your website or GitHub README.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#a8a29e] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Badge Preview Area */}
        <div className="mb-5 rounded-xl border border-[#38342e] bg-[#121110] p-6 flex flex-col items-center justify-center min-h-[100px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716c] mb-3">
            Live Preview
          </span>
          <img
            src={badgeUrl}
            alt={`${productName} Badge Preview`}
            className="h-8 shadow-sm"
          />
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Theme Option */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-1.5">
              Theme
            </label>
            <div className="flex rounded-xl bg-[#282522] p-1 border border-[#38342e]">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-[#a8a29e] hover:text-white"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-[#a8a29e] hover:text-white"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Badge Type Option */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-1.5">
              Rank Mode
            </label>
            <div className="flex rounded-xl bg-[#282522] p-1 border border-[#38342e]">
              <button
                type="button"
                onClick={() => setBadgeType("rank")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  badgeType === "rank"
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-[#a8a29e] hover:text-white"
                }`}
              >
                Global
              </button>
              <button
                type="button"
                onClick={() => setBadgeType("category")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  badgeType === "category"
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-[#a8a29e] hover:text-white"
                }`}
              >
                Category
              </button>
            </div>
          </div>
        </div>

        {/* Copy Snippets */}
        <div className="space-y-3">
          {/* HTML Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">HTML (Websites)</span>
              <button
                type="button"
                onClick={() => handleCopy(htmlCode, "html")}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {copiedFormat === "html" ? "Copied! ✓" : "Copy HTML"}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121110] border border-[#33302b] text-xs font-mono text-[#d6d3d1] overflow-x-auto select-all whitespace-nowrap">
              {htmlCode}
            </div>
          </div>

          {/* Markdown Snippet */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">Markdown (GitHub README)</span>
              <button
                type="button"
                onClick={() => handleCopy(markdownCode, "markdown")}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {copiedFormat === "markdown" ? "Copied! ✓" : "Copy Markdown"}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-[#121110] border border-[#33302b] text-xs font-mono text-[#d6d3d1] overflow-x-auto select-all whitespace-nowrap">
              {markdownCode}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-[#33302b] text-center">
          <p className="text-[11px] text-[#78716c]">
            ⚡ Badges update automatically in real-time as your rank shifts.
          </p>
        </div>
      </div>
    </div>
  );
}
