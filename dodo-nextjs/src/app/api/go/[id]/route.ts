import { NextRequest, NextResponse } from "next/server";
import { getListingById, recordClick } from "@/lib/data";

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

  await recordClick(id);

  let targetUrl = rawUrl;
  if (targetUrl.startsWith("@")) {
    targetUrl = `https://x.com/${targetUrl.slice(1).trim()}`;
  } else if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    // If it is twitter.com, normalize to x.com for modern profile URLs
    if (parsed.hostname === "twitter.com" || parsed.hostname === "www.twitter.com") {
      parsed.hostname = "x.com";
    }
    // Clean extraneous tracking query params before redirect
    parsed.searchParams.forEach((_, key) => {
      parsed.searchParams.delete(key);
    });
    targetUrl = parsed.toString();
  } catch {
    // If URL parsing fails, fallback to rawUrl
    if (targetUrl.startsWith("@")) {
      targetUrl = `https://x.com/${targetUrl.slice(1).trim()}`;
    }
  }

  return NextResponse.redirect(targetUrl, 302);
}
