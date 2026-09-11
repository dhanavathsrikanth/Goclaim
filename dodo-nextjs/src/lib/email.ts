import type { Listing } from "./types";

export interface OutbidAlertParams {
  to: string;
  overtakenTool: Listing;
  outbidByTool: Listing;
  previousRank: number;
  newRank: number;
  targetReclaimBid: number;
  differenceAmount: number;
  counterBidUrl: string;
  category: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; id?: string; simulated?: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "alerts@mail.goclaim.space";

  // If a live Resend API key is configured, send via Resend REST API
  if (resendApiKey && !resendApiKey.startsWith("your_")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `Goclaim Alerts <${fromEmail}>`,
          to,
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Resend API error:", data);
        return { success: false, error: JSON.stringify(data) };
      }
      return { success: true, id: data.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Email dispatch failed:", errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Simulation mode: logged to console for testing and verification
  console.log("=================================================");
  console.log("📧 [SIMULATED EMAIL DISPATCH]");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("Text Preview:\n", text);
  console.log("=================================================");

  return { success: true, simulated: true };
}

export function generateOutbidHtml(params: OutbidAlertParams): string {
  const {
    overtakenTool,
    outbidByTool,
    previousRank,
    differenceAmount,
    targetReclaimBid,
    counterBidUrl,
    category,
  } = params;

  const overtakenName = overtakenTool.product_name || overtakenTool.normalized_url;
  const outbidByName = outbidByTool.product_name || outbidByTool.normalized_url;
  const rankLabel = previousRank === 1 ? "#1" : `#${previousRank}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Outbid Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121110; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121110; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #1c1a18; border: 1px solid #33302b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 30px 20px; border-bottom: 1px solid #282522;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 14px; font-weight: 800; letter-spacing: 1px; color: #e57255; text-transform: uppercase;">
                      ⚡ GOCLAIM · OUTBID ALERT
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #a8a29e; font-weight: 500;">
                      ${category}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

              <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 24px;">
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.25;">
                🚨 You just lost ${rankLabel}!
              </h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #d6d3d1; line-height: 1.5;">
                <strong style="color: #ffffff;">${outbidByName}</strong> just placed a <strong style="color: #e57255;">$${outbidByTool.total_bid.toLocaleString()}</strong> bid and passed <strong style="color: #ffffff;">${overtakenName}</strong> on the <em>${category}</em> board. Click below to reclaim ${rankLabel} for <strong style="color: #ffffff;">$${targetReclaimBid.toLocaleString()}</strong> with 1 click.
              </p>

              <!-- Comparison Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; border-bottom: 1px solid #282522;" width="50%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; margin-bottom: 4px;">
                      New Leader
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #e57255;">
                      ${outbidByName}
                    </div>
                    <div style="font-size: 13px; color: #a8a29e; margin-top: 2px;">
                      Bid: <strong style="color: #ffffff;">$${outbidByTool.total_bid.toLocaleString()}</strong>
                    </div>
                  </td>
                  <td style="padding: 16px; border-bottom: 1px solid #282522;" width="50%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; margin-bottom: 4px;">
                      Your Product
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff;">
                      ${overtakenName}
                    </div>
                    <div style="font-size: 13px; color: #a8a29e; margin-top: 2px;">
                      Bid: <strong style="color: #ffffff;">$${overtakenTool.total_bid.toLocaleString()}</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 14px 16px; text-align: center; background-color: rgba(229, 114, 85, 0.08);">
                    <span style="font-size: 13px; color: #f5f5f4;">
                      Reclaim ${rankLabel} for only <strong style="color: #e57255; font-size: 14px;">+$${differenceAmount.toLocaleString()}</strong> (New Total: $${targetReclaimBid.toLocaleString()})
                    </span>
                  </td>
                </tr>
              </table>

              <!-- 1-Click CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${counterBidUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #e57255; color: #ffffff; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(229, 114, 85, 0.4);">
                      ⚔️ Click here to reclaim ${rankLabel} for $${targetReclaimBid.toLocaleString()} with 1 click →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; font-size: 11px; color: #78716c; margin-top: 4px;">
                1-Click Counter-Bid: Link directly opens checkout with difference (+$${differenceAmount.toLocaleString()}) pre-calculated.
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #161413; border-top: 1px solid #282522; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #78716c;">
                Rank is what you pay — nothing else. Real-time competitive leaderboard.
              </p>
              <p style="margin: 0; font-size: 11px; color: #57534e;">
                Sent to ${params.to} because this email is listed on ${overtakenName}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateOutbidText(params: OutbidAlertParams): string {
  const {
    overtakenTool,
    outbidByTool,
    previousRank,
    differenceAmount,
    targetReclaimBid,
    counterBidUrl,
    category,
  } = params;

  const overtakenName = overtakenTool.product_name || overtakenTool.normalized_url;
  const outbidByName = outbidByTool.product_name || outbidByTool.normalized_url;
  const rankLabel = previousRank === 1 ? "#1" : `#${previousRank}`;

  return `🚨 OUTBID ALERT: You just lost ${rankLabel}!

${outbidByName} just placed a $${outbidByTool.total_bid.toLocaleString()} bid and passed ${overtakenName} on the ${category} board. Click here to reclaim ${rankLabel} for $${targetReclaimBid.toLocaleString()} with 1 click:

${counterBidUrl}

(1-Click Counter-Bid: The link directly opens checkout with the +$${differenceAmount.toLocaleString()} difference pre-calculated and pre-filled).`;
}

export async function sendOutbidAlert(params: OutbidAlertParams) {
  const previousRankLabel = params.previousRank === 1 ? "#1" : `#${params.previousRank}`;
  const outbidByName = params.outbidByTool.product_name || params.outbidByTool.normalized_url;
  const outbidByBid = params.outbidByTool.total_bid.toLocaleString();
  const targetReclaimBid = params.targetReclaimBid.toLocaleString();

  const subject = `🚨 You just lost ${previousRankLabel}! ${outbidByName} just placed a $${outbidByBid} bid and passed you on ${params.category}`;
  const html = generateOutbidHtml(params);
  const text = generateOutbidText(params);

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

export interface ListingConfirmedParams {
  to: string;
  listing: Listing;
  rank: number;
  paidAmount: number;
  totalBid: number;
  claimToken: string;
  category: string;
}

export function generateListingConfirmedHtml(params: ListingConfirmedParams): string {
  const { listing, rank, paidAmount, totalBid, claimToken, category } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
  const dashboardUrl = `${siteUrl}/dashboard?claim=${encodeURIComponent(claimToken)}`;
  const listingUrl = `${siteUrl}/listings/${encodeURIComponent(listing.slug || listing.id)}`;
  const badgeUrl = `${siteUrl}/api/badge/${encodeURIComponent(listing.slug || listing.id)}`;
  const name = listing.product_name || listing.normalized_url;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your listing is live on GoClaim</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121110; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121110; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #1c1a18; border: 1px solid #33302b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="padding: 24px 30px 20px; border-bottom: 1px solid #282522;">
              <span style="font-size: 14px; font-weight: 800; letter-spacing: 1px; color: #e57255; text-transform: uppercase;">
                🎉 GOCLAIM · LISTING CONFIRMED
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 30px 24px;">
              <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #ffffff;">
                You are Rank #${rank}!
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; color: #d6d3d1; line-height: 1.5;">
                Your bid of <strong style="color: #e57255;">$${paidAmount.toLocaleString()}</strong> for <strong style="color: #ffffff;">${name}</strong> has been confirmed. Your current total bid is <strong style="color: #ffffff;">$${totalBid.toLocaleString()}</strong> on the <em>${category}</em> board.
              </p>

              <!-- Stats Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #282522;" width="33%">
                    <div style="font-size: 11px; color: #a8a29e; text-transform: uppercase;">Rank</div>
                    <div style="font-size: 20px; font-weight: 800; color: #e57255;">#${rank}</div>
                  </td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #282522;" width="33%">
                    <div style="font-size: 11px; color: #a8a29e; text-transform: uppercase;">Total Bid</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff;">$${totalBid.toLocaleString()}</div>
                  </td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid #282522;" width="33%">
                    <div style="font-size: 11px; color: #a8a29e; text-transform: uppercase;">Category</div>
                    <div style="font-size: 16px; font-weight: 700; color: #ffffff;">${category}</div>
                  </td>
                </tr>
              </table>

              <!-- Magic Link Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${dashboardUrl}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #e57255; color: #ffffff; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 14px rgba(229, 114, 85, 0.4);">
                      📊 Open Private Founder Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; font-size: 11px; color: #78716c; margin-bottom: 20px;">
                Bookmark this email to always access your live traffic trends, ROI calculator, and listing settings.
              </div>

              <!-- Embed Badge Snippet -->
              <div style="padding: 16px; background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px;">
                <div style="font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
                  🏷️ Embed Your Live Rank Badge
                </div>
                <p style="margin: 0 0 8px; font-size: 12px; color: #a8a29e;">
                  Show off your live ranking on your GitHub README or website:
                </p>
                <div style="background-color: #0c0b0a; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #e57255; word-break: break-all;">
                  [![GoClaim Rank](${badgeUrl})](${listingUrl})
                </div>
              </div>

            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; background-color: #161413; border-top: 1px solid #282522; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #78716c;">
                GoClaim — Real-time competitive leaderboard directory.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateListingConfirmedText(params: ListingConfirmedParams): string {
  const { listing, rank, paidAmount, totalBid, claimToken, category } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
  const dashboardUrl = `${siteUrl}/dashboard?claim=${encodeURIComponent(claimToken)}`;
  const name = listing.product_name || listing.normalized_url;

  return `🎉 YOUR LISTING IS LIVE ON GOCLAIM!

Your bid of $${paidAmount.toLocaleString()} for ${name} has been confirmed.
Current Rank: #${rank}
Total Bid: $${totalBid.toLocaleString()}
Category: ${category}

Access your Private Founder Dashboard:
${dashboardUrl}

(Bookmark the link above to view your traffic stats, CPC savings, and referral sources anytime.)`;
}

export async function sendListingConfirmedEmail(params: ListingConfirmedParams) {
  const subject = `🎉 Your bid is live! You are Rank #${params.rank} on GoClaim`;
  const html = generateListingConfirmedHtml(params);
  const text = generateListingConfirmedText(params);

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}

