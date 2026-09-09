import type { SponsorEntry } from "@/lib/types";

export default function LogoWall({ entries }: { entries: SponsorEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-6 px-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 text-center">
        Sponsored by Top Daily Leaders
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {entries.map((e) => (
          <a
            key={e.listing_id}
            href={`/api/go/${e.listing_id}?from=logowall`}
            target="_blank"
            rel="sponsored noopener noreferrer"
            title={`${e.product_name} — $${e.total_bid.toLocaleString()}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-[#e57255]/50 transition-all shadow-2xs"
          >
            {e.favicon_url ? (
              <img
                src={e.favicon_url}
                alt=""
                className="w-4 h-4 rounded-sm object-cover"
                onError={(ev) => {
                  (ev.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <span className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {e.product_name?.charAt(0) || "?"}
              </span>
            )}
            <span className="text-xs font-medium text-foreground max-w-32 truncate">
              {e.product_name || e.url}
            </span>
            <span className="text-[11px] font-semibold text-[#e57255] tabular-nums">
              ${e.total_bid.toLocaleString()}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}