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
  const fromEmail = process.env.EMAIL_FROM || "alerts@goclaim.space";

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
                <strong style="color: #ffffff;">${outbidByName}</strong> just placed a <strong style="color: #e57255;">$${outbidByTool.total_bid.toLocaleString()}</strong> bid and passed <strong style="color: #ffffff;">${overtakenName}</strong> on the <em>${category}</em> leaderboard.
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
                      ⚔️ Reclaim ${rankLabel} for +$${differenceAmount.toLocaleString()} (1-Click) →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align: center; font-size: 11px; color: #78716c; margin-top: 4px;">
                Link opens pre-filled checkout. You only pay the difference.
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

  return `🚨 OUTBID ALERT: You just lost ${rankLabel} on Goclaim!

${outbidByName} just placed a $${outbidByTool.total_bid.toLocaleString()} bid and passed ${overtakenName} on the ${category} leaderboard.

Leader: ${outbidByName} ($${outbidByTool.total_bid.toLocaleString()})
Your Bid: ${overtakenName} ($${overtakenTool.total_bid.toLocaleString()})

Reclaim ${rankLabel} for only +$${differenceAmount.toLocaleString()} (New total: $${targetReclaimBid.toLocaleString()}):
${counterBidUrl}

(The link above pre-fills the counter-bid checkout so you only pay the difference).`;
}

export async function sendOutbidAlert(params: OutbidAlertParams) {
  const previousRankLabel = params.previousRank === 1 ? "#1" : `#${params.previousRank}`;
  const outbidByName = params.outbidByTool.product_name || params.outbidByTool.normalized_url;

  const subject = `🚨 You just lost ${previousRankLabel}! ${outbidByName} just passed you on ${params.category}`;
  const html = generateOutbidHtml(params);
  const text = generateOutbidText(params);

  return await sendEmail({
    to: params.to,
    subject,
    html,
    text,
  });
}
