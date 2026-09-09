"use client";

interface DemoEmbedProps {
  demoUrl?: string;
  productName?: string;
}

function extractYouTubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      return id ? id.split("?")[0] : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v");
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => ["embed", "v", "shorts"].includes(p));
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return parts[embedIdx + 1].split("?")[0];
      }
    }
    return null;
  } catch {
    return null;
  }
}

function extractLoomId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    if (parsed.hostname.includes("loom.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const shareIdx = parts.findIndex((p) => p === "share" || p === "embed");
      if (shareIdx >= 0 && parts[shareIdx + 1]) {
        return parts[shareIdx + 1].split("?")[0];
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default function DemoEmbed({ demoUrl, productName }: DemoEmbedProps) {
  if (!demoUrl || !demoUrl.trim()) return null;

  const url = demoUrl.trim();
  // Filter out placeholders or invalid mock URLs so no blank/broken video space renders
  if (url.includes("oFfGs3rC7X8") || url === "#" || url === "about:blank") return null;

  // 1. YouTube detection
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>🎬</span>
            <span>Product Walkthrough &amp; Demo</span>
          </span>
        </div>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-md">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
            title={`${productName || "Product"} Demo`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  // 2. Loom detection
  const loomId = extractLoomId(url);
  if (loomId) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>🎥</span>
            <span>Founder Loom Demo</span>
          </span>
        </div>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-md">
          <iframe
            src={`https://www.loom.com/embed/${loomId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`}
            title={`${productName || "Product"} Loom Demo`}
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  // 3. Direct Video file (.mp4, .webm)
  if (/\.(mp4|webm)(\?.*)?$/i.test(url)) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>📹</span>
            <span>Video Preview</span>
          </span>
        </div>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-md flex items-center justify-center">
          <video
            src={url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  // 4. GIF or Image demo
  if (/\.(gif|webp)(\?.*)?$/i.test(url) || url.includes("giphy.com") || url.includes("tenor.com")) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>✨</span>
            <span>Animated Product Demo</span>
          </span>
        </div>
        <div className="w-full rounded-2xl overflow-hidden border border-border bg-muted/30 shadow-md">
          <img
            src={url}
            alt={`${productName || "Product"} Demo`}
            className="w-full h-auto object-cover max-h-[460px]"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return null;
}
