import { ImageResponse } from "@vercel/og";
import { getListingById, getListingBySlug } from "@/lib/data";
import { extractDisplayUrl } from "@/lib/normalize";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const listing = id.startsWith("lst_")
    ? await getListingById(id)
    : await getListingBySlug(id);

  const name =
    listing?.product_name || (listing ? extractDisplayUrl(listing.normalized_url) : "Unknown");
  const bid = listing ? `$${listing.total_bid.toLocaleString()}` : "$0";
  const site = listing ? extractDisplayUrl(listing.normalized_url) : "goclaim.space";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#a3a3a3", marginBottom: 16 }}>
          outbid<span style={{ color: "#525252" }}>.lol</span>
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 36, color: "#a3a3a3", marginBottom: 48 }}>
          {site}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#fbbf24",
            }}
          >
            {bid}
          </div>
          <div style={{ fontSize: 32, color: "#737373" }}>ranked bid</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}