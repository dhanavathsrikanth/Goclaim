import { NextRequest, NextResponse } from "next/server";
import { getListingById, recordClick } from "@/lib/data";
import { extractXHandle } from "@/lib/normalize";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  let rawUrl = (listing.url || listing.normalized_url || "").trim();
  if (!rawUrl) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Extract referral source from URL search param or referer header
  const reqUrl = new URL(_req.url);
  let source = reqUrl.searchParams.get("from")?.trim() || "";

  if (!source) {
    const referer = _req.headers.get("referer") || "";
    if (referer.includes("/listings/")) {
      source = "listing_page";
    } else if (referer.includes("board=today")) {
      source = "today";
    } else if (referer.includes("board=daily")) {
      source = "daily";
    } else if (referer.includes("category=")) {
      const match = referer.match(/category=([^&]+)/);
      source = match
        ? `category_${decodeURIComponent(match[1]).toLowerCase().replace(/[^a-z0-9]+/g, "_")}`
        : "category";
    } else if (
      referer &&
      !referer.includes("goclaim") &&
      !referer.includes("localhost") &&
      !referer.includes("127.0.0.1")
    ) {
      source = "external";
    } else {
      source = "all-time";
    }
  }

  await recordClick(id, source);

  // 1. If it is an X (Twitter) profile or handle, format strictly as https://x.com/{handle}
  // (X rejects URLs with '@' in path like x.com/@user with 403 Forbidden)
  const xHandle = extractXHandle(rawUrl) || extractXHandle(listing.normalized_url);
  if (xHandle) {
    return NextResponse.redirect(`https://x.com/${xHandle}`, 302);
  }

  let targetUrl = rawUrl;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    // If it is twitter.com or x.com, ensure modern canonical x.com and strip illegal '@' in path
    if (host === "twitter.com" || host === "x.com") {
      parsed.hostname = "x.com";
      parsed.pathname = parsed.pathname.replace(/^\/+@?/, "/");
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
    }
    // Clean extraneous tracking query params before redirect
    parsed.searchParams.forEach((_, key) => {
      parsed.searchParams.delete(key);
    });
    targetUrl = parsed.toString();
  } catch {
    // If URL parsing fails, fallback
    if (targetUrl.startsWith("@")) {
      targetUrl = `https://x.com/${targetUrl.slice(1).trim()}`;
    }
  }

  return NextResponse.redirect(targetUrl, 302);
}
