import { NextRequest, NextResponse } from "next/server";
import { getListings, getBoardListings, getListingBySlug, getListingById } from "@/lib/data";
import { rankListings } from "@/lib/ranking";
import type { BoardType, Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

function estimateTextWidth(text: string, fontSize: number = 11): number {
  return Math.round(text.length * (fontSize * 0.62));
}

function renderBadgeSvg({
  rankText,
  theme = "dark",
  isTopOne = false,
}: {
  rankText: string;
  theme?: "dark" | "light";
  isTopOne?: boolean;
}): string {
  const isDark = theme !== "light";

  // Segment widths
  const leftLabel = "GOCLAIM";
  const leftTextWidth = estimateTextWidth(leftLabel, 10);
  const leftWidth = 28 + leftTextWidth + 14; // icon + text + padding

  const rightTextWidth = estimateTextWidth(rankText, 11);
  const rightWidth = rightTextWidth + 24; // padding

  const totalWidth = leftWidth + rightWidth;
  const height = 32;

  // Colors
  const bgLeft = isDark ? "#1f1e1c" : "#f5efe9";
  const bgRight = isTopOne
    ? isDark
      ? "#2e1b16"
      : "#fdf0ec"
    : isDark
    ? "#141312"
    : "#ffffff";

  const borderColor = isTopOne
    ? isDark
      ? "rgba(229, 114, 85, 0.45)"
      : "rgba(229, 114, 85, 0.55)"
    : isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.12)";

  const leftTextColor = isDark ? "#a8a29e" : "#78716c";
  const rightTextColor = isTopOne
    ? "#e57255"
    : isDark
    ? "#f5f5f4"
    : "#1c1917";

  const rankGlow = isTopOne
    ? `<rect x="${leftWidth}" y="1" width="${rightWidth - 1}" height="${height - 2}" rx="5" fill="#e57255" opacity="0.08"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" role="img" aria-label="Goclaim Badge: ${rankText}">
  <title>Goclaim Badge: ${rankText}</title>
  <defs>
    <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e57255"/>
      <stop offset="100%" stop-color="#f0886e"/>
    </linearGradient>
    <clipPath id="badgeClip">
      <rect width="${totalWidth}" height="${height}" rx="6"/>
    </clipPath>
  </defs>

  <!-- Outer Card with Border -->
  <g clip-path="url(#badgeClip)">
    <!-- Left segment -->
    <rect x="0" y="0" width="${leftWidth}" height="${height}" fill="${bgLeft}"/>
    <!-- Right segment -->
    <rect x="${leftWidth}" y="0" width="${rightWidth}" height="${height}" fill="${bgRight}"/>
    ${rankGlow}

    <!-- Segment separator line -->
    <line x1="${leftWidth}" y1="0" x2="${leftWidth}" y2="${height}" stroke="${borderColor}" stroke-width="1"/>

    <!-- Goclaim Brand Logo (Apex G mark) -->
    <g transform="translate(9, 9)">
      <path d="M10.8 5.2C10.2 3.4 8.6 2.2 6.7 2.2C4.1 2.2 1.9 4.3 1.9 7C1.9 9.7 4.1 11.8 6.7 11.8C9.3 11.8 11.3 9.9 11.5 7.5H7.2V6H12.4V7C12.4 10.3 9.8 12.8 6.7 12.8C3.5 12.8 0.8 10.2 0.8 7C0.8 3.8 3.5 1.1 6.7 1.1C9 1.1 11.1 2.5 12 4.6L10.8 5.2Z" fill="url(#primaryGrad)"/>
      <path d="M7.5 6.8L12 2.3M12 2.3H9M12 2.3V5.3" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="2.3" r="0.7" fill="#FF8A65"/>
    </g>

    <!-- Left Text -->
    <text x="28" y="20"
      fill="${leftTextColor}"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      font-size="10"
      font-weight="700"
      letter-spacing="0.8">
      ${leftLabel}
    </text>

    <!-- Right Rank Text -->
    <text x="${leftWidth + 12}" y="20.5"
      fill="${rightTextColor}"
      font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      font-size="11"
      font-weight="700"
      letter-spacing="0.2">
      ${rankText}
    </text>
  </g>

  <!-- Border -->
  <rect width="${totalWidth}" height="${height}" rx="6" fill="none" stroke="${borderColor}" stroke-width="1"/>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);

  const theme = (searchParams.get("theme") || "dark") as "dark" | "light";
  const badgeType = searchParams.get("type") || "rank"; // "rank" or "category"
  const board = (searchParams.get("board") || "all-time") as BoardType;

  // Resolve listing
  let listing: Listing | undefined;
  if (slug.startsWith("lst_")) {
    listing = await getListingById(slug);
  } else {
    listing = await getListingBySlug(slug);
  }

  if (!listing || listing.status !== "confirmed") {
    // Return fallback badge
    const fallbackSvg = renderBadgeSvg({
      rankText: "FEATURED ON GOCLAIM",
      theme,
      isTopOne: false,
    });
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    });
  }

  const allListings = await getBoardListings(board);
  const rankedAll = rankListings(allListings, board);
  const globalRank = rankedAll.findIndex((l) => l.id === listing?.id) + 1;

  let rankText = "";
  let isTopOne = false;

  if (badgeType === "category" && listing.category && listing.category !== "Other") {
    const categoryListings = rankedAll.filter((l) => l.category === listing?.category);
    const catRank = categoryListings.findIndex((l) => l.id === listing?.id) + 1;
    isTopOne = catRank === 1;
    rankText = `#${catRank || globalRank} IN ${listing.category.toUpperCase()}`;
  } else {
    isTopOne = globalRank === 1;
    rankText = globalRank > 0 ? `#${globalRank} ON GOCLAIM` : "RANKED ON GOCLAIM";
  }

  const svg = renderBadgeSvg({
    rankText,
    theme,
    isTopOne,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=120, s-maxage=120, stale-while-revalidate=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
