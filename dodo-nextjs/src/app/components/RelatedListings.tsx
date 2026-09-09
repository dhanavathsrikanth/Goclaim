import Link from "next/link";
import type { Listing } from "@/lib/types";
import { extractDisplayUrl } from "@/lib/normalize";
import FaviconImg from "./FaviconImg";

type Props = {
  items: Listing[];
  category: string;
};

export default function RelatedListings({ items, category }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        More in {category}
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listings/${item.slug || item.id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-[#e57255]/40 transition-colors shadow-sm"
          >
            {item.favicon_url ? (
              <FaviconImg
                src={item.favicon_url}
                className="w-6 h-6 rounded shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 border border-border/50">
                {item.product_name?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.product_name || extractDisplayUrl(item.normalized_url)}
              </p>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {extractDisplayUrl(item.normalized_url)}
              </p>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
              ${item.total_bid.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}