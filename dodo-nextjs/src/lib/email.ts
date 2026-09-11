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

// ---------------------------------------------------------------------------
// Shared email primitives
// ---------------------------------------------------------------------------

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMAIL_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function emailDocument(opts: {
  title: string;
  preheader: string;
  bodyHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(opts.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-card { border-radius: 12px !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .stack { display: block !important; width: 100% !important; }
      .stack-pad { padding-top: 12px !important; }
      .cta { padding: 16px 20px !important; font-size: 16px !important; }
      .hero-rank { font-size: 44px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #121110; font-family: ${EMAIL_FONT}; color: #f5f5f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; mso-hide: all;" aria-hidden="true">
    ${escapeHtml(opts.preheader)}
  </div>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #121110; padding: 32px 15px;">
    <tr>
      <td align="center">
        <table class="email-card" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="max-width: 560px; background-color: #1c1a18; border: 1px solid #33302b; border-radius: 16px; overflow: hidden;">
          ${opts.bodyHtml}
        </table>
        <div style="max-width: 560px; margin: 16px auto 0; font-size: 11px; line-height: 1.6; color: #57534e; text-align: center; font-family: ${EMAIL_FONT};">
          GoClaim — rank is what you pay, nothing else.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailEyebrow(opts: { label: string; pill?: string }): string {
  const pill = opts.pill
    ? `<span style="display: inline-block; font-size: 12px; color: #e8e2da; font-weight: 600; background-color: #2a2723; border: 1px solid #3a352f; border-radius: 999px; padding: 4px 12px;">${escapeHtml(opts.pill)}</span>`
    : "";
  return `<tr>
    <td class="email-pad" style="padding: 24px 30px 18px; border-bottom: 1px solid #282522;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
        <tr>
          <td align="left" style="font-size: 13px; font-weight: 800; letter-spacing: 1.5px; color: #e57255; text-transform: uppercase; font-family: ${EMAIL_FONT};">
            ${escapeHtml(opts.label)}
          </td>
          <td align="right">${pill}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function emailCta(opts: { href: string; label: string }): string {
  return `<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" style="padding-bottom: 10px;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${escapeHtml(opts.href)}" style="width:480px;height:52px;" arcsize="18%" fillcolor="#e57255" stroke="f">
          <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">${escapeHtml(opts.label)}</center></v:textbox>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-- -->
        <a class="cta" href="${escapeHtml(opts.href)}" target="_blank" rel="noopener" style="display: block; width: 100%; box-sizing: border-box; background-color: #e57255; color: #ffffff; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 15px 20px; border-radius: 12px;">
          ${escapeHtml(opts.label)}
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>`;
}

function emailFooter(opts: { to: string; reason: string }): string {
  return `<tr>
    <td class="email-pad" style="padding: 20px 30px; background-color: #161413; border-top: 1px solid #282522; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.6; color: #a8a29e; font-family: ${EMAIL_FONT};">
        ${opts.reason}
      </p>
      <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #57534e; font-family: ${EMAIL_FONT};">
        Sent to ${escapeHtml(opts.to)} · GoClaim, real-time competitive leaderboard
      </p>
    </td>
  </tr>`;
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
          reply_to: fromEmail,
          headers: {
            "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
          },
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

  const overtakenName = escapeHtml(overtakenTool.product_name || overtakenTool.normalized_url);
  const outbidByName = escapeHtml(outbidByTool.product_name || outbidByTool.normalized_url);
  const rankLabel = previousRank === 1 ? "#1" : `#${previousRank}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
  const boardUrl = `${siteUrl}/`;
  const preheader = `Reclaim ${rankLabel} for +$${differenceAmount.toLocaleString()} — 1-click checkout inside.`;

  const bodyHtml = `
          ${emailEyebrow({ label: "⚡ GoClaim · Rank alert", pill: category })}

          <tr>
            <td class="email-pad" style="padding: 28px 30px 24px;">
              <div style="display: inline-block; font-size: 12px; font-weight: 700; color: #fda4af; background-color: rgba(229, 114, 85, 0.12); border: 1px solid rgba(229, 114, 85, 0.35); border-radius: 999px; padding: 5px 14px; margin-bottom: 14px; font-family: ${EMAIL_FONT};">
                Live board · someone just passed you
              </div>
              <h1 style="margin: 0 0 10px; font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.25; font-family: ${EMAIL_FONT};">
                You just lost ${escapeHtml(rankLabel)}
              </h1>
              <p style="margin: 0 0 22px; font-size: 15px; color: #d6d3d1; line-height: 1.6; font-family: ${EMAIL_FONT};">
                <strong style="color: #ffffff;">${outbidByName}</strong> placed a
                <strong style="color: #e57255;">$${outbidByTool.total_bid.toLocaleString()}</strong>
                bid and passed <strong style="color: #ffffff;">${overtakenName}</strong> on the
                <em>${escapeHtml(category)}</em> board. Reclaim ${escapeHtml(rankLabel)} for
                <strong style="color: #ffffff;">$${targetReclaimBid.toLocaleString()}</strong> with 1 click.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td class="stack" style="padding: 16px 18px; border-bottom: 1px solid #282522;" width="50%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; font-family: ${EMAIL_FONT};">
                      New leader
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #e57255; font-family: ${EMAIL_FONT};">
                      ${outbidByName}
                    </div>
                    <div style="font-size: 13px; color: #a8a29e; margin-top: 2px; font-family: ${EMAIL_FONT};">
                      Bid: <strong style="color: #ffffff;">$${outbidByTool.total_bid.toLocaleString()}</strong>
                    </div>
                  </td>
                  <td class="stack" style="padding: 16px 18px; border-bottom: 1px solid #282522;" width="50%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; font-family: ${EMAIL_FONT};">
                      Your product
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; font-family: ${EMAIL_FONT};">
                      ${overtakenName}
                    </div>
                    <div style="font-size: 13px; color: #a8a29e; margin-top: 2px; font-family: ${EMAIL_FONT};">
                      Bid: <strong style="color: #ffffff;">$${overtakenTool.total_bid.toLocaleString()}</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 14px 18px; text-align: center; background-color: rgba(229, 114, 85, 0.10);">
                    <span style="font-size: 13px; color: #f5f5f4; font-family: ${EMAIL_FONT};">
                      Reclaim ${escapeHtml(rankLabel)} for only
                      <strong style="color: #e57255; font-size: 15px;">+$${differenceAmount.toLocaleString()}</strong>
                      <span style="color: #a8a29e;">(new total $${targetReclaimBid.toLocaleString()})</span>
                    </span>
                  </td>
                </tr>
              </table>

              ${emailCta({ href: counterBidUrl, label: `Reclaim ${rankLabel} for $${targetReclaimBid.toLocaleString()} →` })}

              <div style="text-align: center; margin-bottom: 18px;">
                <a href="${escapeHtml(boardUrl)}" target="_blank" rel="noopener" style="font-size: 13px; font-weight: 600; color: #e57255; text-decoration: underline; font-family: ${EMAIL_FONT};">
                  View the live board
                </a>
              </div>
              <div style="text-align: center; font-size: 11px; line-height: 1.6; color: #78716c; font-family: ${EMAIL_FONT};">
                1-click counter-bid opens secure checkout with the +$${differenceAmount.toLocaleString()} difference pre-filled. Rank is what you pay — nothing else.
              </div>

            </td>
          </tr>

          ${emailFooter({
            to: params.to,
            reason: `You're getting this because <strong style="color:#d6d3d1;">${overtakenName}</strong> lists this email for bid alerts. Reply to this email to contact us.`,
          })}`;

  return emailDocument({ title: "Rank Alert", preheader, bodyHtml });
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";

  return `RANK ALERT — You just lost ${rankLabel}

${outbidByName} placed a $${outbidByTool.total_bid.toLocaleString()} bid and passed ${overtakenName} on the ${category} board.

Reclaim ${rankLabel} for only +$${differenceAmount.toLocaleString()} (new total $${targetReclaimBid.toLocaleString()}):

${counterBidUrl}

View the live board: ${siteUrl}/

The link opens secure checkout with the difference pre-filled. Rank is what you pay — nothing else.
— GoClaim alerts`;
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
  const name = escapeHtml(listing.product_name || listing.normalized_url);
  const preheader = `You're Rank #${rank} on GoClaim — dashboard, badge and next steps inside.`;

  const steps = [
    {
      n: "1",
      title: "Watch your rank live",
      body: "Your listing is on the public board now. If someone outranks you, we'll email you instantly with a 1-click reclaim link.",
    },
    {
      n: "2",
      title: "Use your founder dashboard",
      body: "Bookmark your private link — traffic trends, CPC savings and listing settings live there.",
    },
    {
      n: "3",
      title: "Show off your badge",
      body: "Embed your live rank badge on your README or site. It updates automatically.",
    },
  ]
    .map(
      (s) => `<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="margin-bottom: 10px;">
        <tr>
          <td width="32" valign="top" style="padding-right: 12px;">
            <div style="width: 28px; height: 28px; border-radius: 999px; background-color: rgba(229, 114, 85, 0.14); border: 1px solid rgba(229, 114, 85, 0.4); color: #e57255; font-size: 14px; font-weight: 800; text-align: center; line-height: 28px; font-family: ${EMAIL_FONT};">${s.n}</div>
          </td>
          <td valign="top">
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; font-family: ${EMAIL_FONT};">${s.title}</div>
            <div style="font-size: 13px; line-height: 1.6; color: #a8a29e; font-family: ${EMAIL_FONT};">${s.body}</div>
          </td>
        </tr>
      </table>`
    )
    .join("");

  const bodyHtml = `
          ${emailEyebrow({ label: "🎉 Goclaim · Listing confirmed", pill: category })}

          <tr>
            <td class="email-pad" style="padding: 28px 30px 24px;">
              <div style="text-align: center; margin-bottom: 16px;">
                <div class="hero-rank" style="font-size: 52px; font-weight: 800; color: #e57255; line-height: 1; font-family: ${EMAIL_FONT};">#${rank}</div>
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #a8a29e; margin-top: 6px; font-family: ${EMAIL_FONT};">Current rank · ${escapeHtml(category)}</div>
              </div>
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3; text-align: center; font-family: ${EMAIL_FONT};">
                ${name} is live on GoClaim
              </h1>
              <p style="margin: 0 0 22px; font-size: 15px; color: #d6d3d1; line-height: 1.6; text-align: center; font-family: ${EMAIL_FONT};">
                Your bid of <strong style="color: #e57255;">$${paidAmount.toLocaleString()}</strong> is confirmed.
                Total bid <strong style="color: #ffffff;">$${totalBid.toLocaleString()}</strong>.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px; margin-bottom: 20px; overflow: hidden;">
                <tr>
                  <td class="stack" align="center" style="padding: 14px 12px; border-bottom: 1px solid #282522;" width="33%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${EMAIL_FONT};">Rank</div>
                    <div style="font-size: 22px; font-weight: 800; color: #e57255; font-family: ${EMAIL_FONT};">#${rank}</div>
                  </td>
                  <td class="stack" align="center" style="padding: 14px 12px; border-bottom: 1px solid #282522;" width="33%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${EMAIL_FONT};">Total bid</div>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; font-family: ${EMAIL_FONT};">$${totalBid.toLocaleString()}</div>
                  </td>
                  <td class="stack stack-pad" align="center" style="padding: 14px 12px;" width="33%">
                    <div style="font-size: 11px; font-weight: 700; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.8px; font-family: ${EMAIL_FONT};">Board</div>
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff; font-family: ${EMAIL_FONT};">${escapeHtml(category)}</div>
                  </td>
                </tr>
              </table>

              ${emailCta({ href: dashboardUrl, label: "Open private founder dashboard →" })}

              <div style="text-align: center; margin-bottom: 22px;">
                <a href="${escapeHtml(listingUrl)}" target="_blank" rel="noopener" style="font-size: 13px; font-weight: 600; color: #e57255; text-decoration: underline; font-family: ${EMAIL_FONT};">
                  View your live listing
                </a>
              </div>

              <div style="margin-bottom: 6px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #e57255; font-family: ${EMAIL_FONT};">
                What happens next
              </div>
              <div style="margin-bottom: 20px;">${steps}</div>

              <div style="padding: 16px 18px; background-color: #141312; border: 1px solid #2e2b26; border-radius: 12px;">
                <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 6px; font-family: ${EMAIL_FONT};">
                  Embed your live rank badge
                </div>
                <p style="margin: 0 0 10px; font-size: 12px; line-height: 1.6; color: #a8a29e; font-family: ${EMAIL_FONT};">
                  Paste this markdown in your GitHub README or site — it updates automatically:
                </p>
                <div style="background-color: #0c0b0a; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 11px; line-height: 1.6; color: #e57255; word-break: break-all;">
                  [![GoClaim Rank](${escapeHtml(badgeUrl)})](${escapeHtml(listingUrl)})
                </div>
              </div>
              <div style="text-align: center; font-size: 11px; line-height: 1.6; color: #78716c; margin-top: 12px; font-family: ${EMAIL_FONT};">
                Bookmark this email — your dashboard link is the only way back to private stats and settings.
              </div>

            </td>
          </tr>
          ${emailFooter({
            to: params.to,
            reason: `You're getting this because this email was used to claim <strong style="color:#d6d3d1;">${name}</strong> on GoClaim. Reply to this email to contact us.`,
          })}`;

  return emailDocument({ title: "Your listing is live on GoClaim", preheader, bodyHtml });
}

export function generateListingConfirmedText(params: ListingConfirmedParams): string {
  const { listing, rank, paidAmount, totalBid, claimToken, category } = params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goclaim.space";
  const dashboardUrl = `${siteUrl}/dashboard?claim=${encodeURIComponent(claimToken)}`;
  const name = listing.product_name || listing.normalized_url;

  const listingUrl = `${siteUrl}/listings/${encodeURIComponent(listing.slug || listing.id)}`;

  return `YOUR LISTING IS LIVE — Rank #${rank} on GoClaim

Your bid of $${paidAmount.toLocaleString()} for ${name} is confirmed.
Rank: #${rank} | Total bid: $${totalBid.toLocaleString()} | Board: ${category}

Private founder dashboard (bookmark this — it's the only way back):
${dashboardUrl}

View your live listing:
${listingUrl}

What happens next:
1. If someone outranks you, we email you instantly with a 1-click reclaim link.
2. Track traffic trends and CPC savings in your dashboard.
3. Embed your live rank badge on your README or site.

— GoClaim alerts`;
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

