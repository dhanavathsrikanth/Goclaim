"use client";
import { CATEGORIES } from "@/lib/types";

type Props = {
  active: string;
  onChange: (category: string) => void;
  counts: Record<string, number>;
  totalCount: number;
};

const CATEGORY_ICONS: Record<string, string> = {
  All: "⊞",
  "AI Agents & Infrastructure": "🤖",
  "Developer Tools": "</>",
  "Startups & SaaS": "🚀",
  "Marketing & Advertising": "📢",
  "SEO & AI Visibility": "🎯",
  "Design & Creative": "🎨",
  "Productivity & Personal Tools": "⚡",
  "Crypto, Web3 & Investing": "₿",
  "Business, Finance & Legal": "💼",
  "Writing & Content": "✍️",
  "Social Media & Creator Tools": "📱",
  "Security, Privacy & Compliance": "🔒",
  "Health, Fitness & Wellness": "💚",
  "Directories, Launch & Discovery": "🧭",
  "Agencies, Studios & Services": "🏢",
  "Hiring, Jobs & Careers": "👥",
  "Education & Learning": "🎓",
  "Domains & Web Assets": "🌐",
  Other: "✨",
};

export default function CategoryFilter({
  active,
  onChange,
  counts,
  totalCount,
}: Props) {
  return (
    <div className="relative z-20 overflow-hidden rounded-full bg-muted/80 p-1 border border-border/40 shadow-2xs">
      <nav
        aria-label="Ranking categories"
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full items-center gap-1">
          {CATEGORIES.map((cat) => {
            const activeCat = active === cat;
            const count = cat === "All" ? totalCount : counts[cat] || 0;
            const icon = CATEGORY_ICONS[cat] || "🏷️";

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange(cat)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all outline-none select-none ${
                  activeCat
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/70"
                }`}
              >
                <span className="text-[11px] opacity-85">{icon}</span>
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] tabular-nums ${
                      activeCat
                        ? "bg-white/20 text-white"
                        : "bg-background/80 text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}