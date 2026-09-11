export const metadata = {
  title: "Privacy Policy — goclaim.space",
  description: "Privacy Policy for goclaim.space pay-to-rank leaderboard.",
};

export default function PrivacyPage() {
  return (
    <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. What we collect</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Listing data (public):</strong> product URL, normalized domain, product name, description, category, favicon/logo/banner you provide, bid amounts, click counts. This is displayed publicly — do not submit anything private.</li>
              <li><strong>Claim email (private):</strong> required for free coupon claims and used to generate your dashboard claim link. Paid checkouts may receive the buyer email from Dodo Payments for the same purpose.</li>
              <li><strong>Payment metadata:</strong> amount, status, timestamps. Card numbers and full payment credentials are handled by Dodo Payments, never stored by us.</li>
              <li><strong>Usage signals:</strong> outbound click counts per listing (with coarse source, e.g. leaderboard vs listing page) and an anonymous presence ping (random client id + page path) powering the &quot;viewing now&quot; counter.</li>
              <li><strong>Technical basics:</strong> standard server logs (IP, user agent, timestamps) for security and debugging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Cookies &amp; local storage</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>We store a random anonymous client id (<code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">outbid_cid</code>) in localStorage for the &quot;viewing now&quot; counter. No ad trackers.</li>
              <li>Payment checkout runs on Dodo Payments, which may set its own cookies under its own policy.</li>
              <li>We do not run third-party advertising or cross-site tracking pixels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How we use it</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Operate the leaderboard: rank listings, track clicks, issue dashboard claim links, announce winners.</li>
              <li>Enforce coupon limits (1 per domain, 1 per email) and detect fraud/abuse.</li>
              <li>Process outbid alerts and milestone announcements you trigger by bidding.</li>
              <li>Security, debugging, and legal compliance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. What we share</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Public by design:</strong> listing URL, name, bid, clicks, category, and creative assets are visible to everyone, including search engines.</li>
              <li><strong>Processors:</strong> Dodo Payments (checkout), Neon (database hosting), Cloudflare (hosting/CDN). They handle data only to provide their service.</li>
              <li><strong>Never:</strong> we do not sell personal data or share claim emails with advertisers or other listers.</li>
              <li><strong>Legal:</strong> we may disclose data if required by law or to prevent fraud, abuse, or harm.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Retention</h2>
            <p>
              Public listing and payment records are kept as the permanent archive of the board
              (including the Hall of Fame). Claim emails are kept while your listing exists so
              you can access your dashboard. Anonymous presence pings expire within minutes.
              Contact us to request deletion of your private email data; public board history
              for completed bids is retained for transparency.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Your rights</h2>
            <p>
              Depending on where you live (e.g. GDPR in the EU/UK), you may have rights to
              access, correct, or delete your personal data, object to processing, or request a
              copy. Contact us (see §7) and we will respond within a reasonable time. Note that
              confirmed bid history is a public record of a completed transaction and may be
              retained even after an email-deletion request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Contact</h2>
            <p>
              Privacy questions or requests: use the contact channel on the About page and put
              &quot;Privacy&quot; in the subject. Include the email address you used at checkout
              so we can verify ownership.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
