import Link from "next/link";

export const metadata = {
  title: "Terms of Service — goclaim.space",
  description: "Terms of Service for goclaim.space pay-to-rank leaderboard.",
};

export default function TermsPage() {
  return (
    <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: September 2026</p>

        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. What this is</h2>
            <p>
              goclaim.space is a pay-to-rank leaderboard. You submit a product URL or X handle,
              pay a whole-dollar bid, and your rank is determined solely by the amount paid.
              Higher bid = higher rank. That is the entire service. Rankings are public and
              visible to everyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must be at least 18 years old (or the age of majority where you live) to pay for a listing.</li>
              <li>You must have the right to promote the URL or handle you submit (your own product, or permission from the owner).</li>
              <li>One listing per URL/handle. Duplicate or impersonating listings may be removed without refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Bids &amp; ranking</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Bids are whole US dollars: $2 minimum, $999,999 maximum.</li>
              <li>To take #1 you must bid at least $5 more than the current #1.</li>
              <li>Raising an existing listing costs the difference only ($1 minimum).</li>
              <li>Ties resolve by age: the older listing keeps the higher rank.</li>
              <li>Ranks are never exclusive or fixed-term — anyone can outrank you at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Payments &amp; refunds</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Payments are processed by Dodo Payments. Card details go to Dodo, never to us. See our <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.</li>
              <li><strong>All payments are final and non-refundable</strong> — including if you are outranked, receive fewer clicks than hoped, or your listing is removed for violating these terms.</li>
              <li>Prices are in USD. Any taxes, VAT, or fees are your responsibility and may be collected at checkout.</li>
              <li>Chargebacks or payment reversals may result in removal of the listing and a ban on future listings. Amounts recovered by fraud will not be re-credited as rank.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Free listings &amp; coupon codes</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Launch offer:</strong> the first 20 confirmed listings claim a $2 starter free with just an email — no code needed.</li>
              <li>Promotional codes (e.g. FIRST20) cover a $2 starter listing at no charge once launch slots run out.</li>
              <li>Strict limits: <strong>1 free claim per domain/handle, 1 per email, new listings only</strong>. Codes have a fixed number of uses and an expiry date.</li>
              <li>Free listings rank at $2 and can be outranked by any paid bid at any time.</li>
              <li>Codes are revocable. Abuse — duplicate domains, disposable-email farming, scripting, or resale of codes — results in removal of the listings without refund or compensation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. What you get — and don&apos;t</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You get: a public ranked listing, a public listing page, and tracked outbound clicks to your URL.</li>
              <li>You explicitly do <strong>not</strong> get: guaranteed traffic, clicks, customers, revenue, search-engine ranking, or any algorithmic boost outside this board.</li>
              <li>Rank is not an endorsement, certification, review, or recommendation. It signals who paid the most — nothing more.</li>
              <li>Outbound links carry <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">rel=&quot;sponsored&quot;</code> and pass no PageRank, per search-engine paid-link policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Prohibited content &amp; moderation</h2>
            <p className="mb-2">You may not list URLs or handles promoting:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Anything illegal, fraudulent, or deceptive (scams, phishing, fake crypto doublers, counterfeit goods).</li>
              <li>Malware, spyware, or pages designed to harm devices or steal credentials.</li>
              <li>Adult sexual content, non-consensual imagery, or content sexualizing minors (zero tolerance).</li>
              <li>Hate, harassment, or content praising violent extremism.</li>
              <li>Chat/invite links (Telegram, WhatsApp, Discord, Messenger, Signal) — these are blocked at submission.</li>
              <li>Impersonation of another person, brand, or project.</li>
            </ul>
            <p className="mt-2">
              We may remove or hide any listing at our discretion for violations, legal requests,
              or payment fraud — without refund. Removed listings disappear from all boards.
              To report a listing, contact us (see §12).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Your content license</h2>
            <p>
              By submitting a listing you grant us a worldwide, non-exclusive, royalty-free
              license to display your product name, URL, favicon/logo, banner, and description
              on the site, in social announcements, and in the Hall of Fame archive. You confirm
              you have the rights to grant this.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Takedowns</h2>
            <p>
              If you believe a listing infringes your trademark, copyright, or impersonates you,
              contact us with the listing URL, your relationship to the brand, and evidence of
              ownership. Valid complaints result in removal. Repeat infringers are banned.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Disclaimers &amp; liability</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>The service is provided &quot;as is&quot; without warranties of any kind.</li>
              <li>To the maximum extent permitted by law, our total liability for any claim is limited to the amount you paid for the listing in question.</li>
              <li>We are not liable for lost profits, lost traffic, or any indirect or consequential damages.</li>
              <li>You agree to indemnify us against claims arising from your listing content or your violation of these terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes</h2>
            <p>
              We may update these terms as the product evolves (e.g. new boards, features, or
              legal requirements). Continued use after changes means acceptance. Material
              changes to refunds or ranking mechanics will be noted on this page&apos;s date line.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact</h2>
            <p>
              Questions, takedowns, or reports: reach out via the site&apos;s contact channel
              listed on the <Link href="/about" className="underline underline-offset-2">About</Link> page.
              Include the listing URL and a clear description of the issue.
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            Plain-language summary, not legal advice: you pay for a public rank, not for results.
            Payments are final. Follow the content rules. We can remove rule-breaking listings.
          </p>
        </div>
      </div>
    </div>
  );
}
