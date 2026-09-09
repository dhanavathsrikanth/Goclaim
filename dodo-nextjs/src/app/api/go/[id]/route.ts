import { NextRequest, NextResponse } from "next/server";
import { getListingById, recordClick } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing || !listing.url) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  await recordClick(id);

  let targetUrl = listing.url;
  if (!targetUrl.startsWith("http")) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    parsed.searchParams.forEach((_, key) => {
      parsed.searchParams.delete(key);
    });
    targetUrl = parsed.toString();
  } catch {
    // use as-is
  }

  return NextResponse.redirect(targetUrl, 302);
}
