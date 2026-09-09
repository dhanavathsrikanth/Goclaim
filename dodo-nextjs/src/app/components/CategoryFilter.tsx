"use client";
import { CATEGORIES } from "@/lib/types";
import CategoryIcon from "./CategoryIcon";

type Props = {
  active: string;
  onChange: (category: string) => void;
  counts: Record<string, number>;
  totalCount: number;
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

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onChange(cat)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all outline-none select-none ${
                  activeCat
                    ? "bg-[#e57255] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/70"
                }`}
              >
                <CategoryIcon
                  category={cat}
                  className={`size-3.5 shrink-0 transition-transform ${
                    activeCat ? "text-white scale-105" : "opacity-75"
                  }`}
                />
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-mono ${
                      activeCat
                        ? "bg-white/20 text-white font-bold"
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