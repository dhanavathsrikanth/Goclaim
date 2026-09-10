export default function RulesPage() {
  return (
    <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Rules</h1>

        <div className="space-y-8 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Rank is what you pay — nothing else.</h2>
            <p>
              goclaim.space is a public leaderboard. There are no third-party ads, no API keys, and no revenue share.
              The only promotion on the site is the daily #1 winner&apos;s own banner — the prize for outbidding everyone else.
              You pay to stand above everyone else. Rank is the bid — nothing else.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">How ranking works</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>Bids are whole US dollars, $2 minimum, $1 at a time.</li>
              <li>Your amount decides the rank. Paying less than #1 still puts you on the board at whatever place that bid can take.</li>
              <li>Equal bids stay in the order they were placed — the older bid keeps the higher rank.</li>
              <li>To take #1, you must pay at least $5 more than the current #1.</li>
              <li>To raise your rank, enter the same URL or @handle again and pay only the difference (+$1 minimum).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">What you can list</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>A product website URL.</li>
              <li>An X (@) handle.</li>
              <li>Chat and invite links are not allowed — Telegram, WhatsApp, Discord, Messenger, Signal, and similar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">What you get</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>A ranked listing on the public leaderboard(s).</li>
              <li>Clicks from the board go directly to your submitted URL or X profile (query parameters are stripped).</li>
              <li>Your listing appears on All-time, Today, Daily, and category-specific boards.</li>
              <li>A public product page showing your description, category, bid amount, listing time, and click count.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">What you explicitly do NOT get</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>Guaranteed traffic, clicks, customers, revenue, or any specific result.</li>
              <li>Exclusive or fixed-duration placement at a rank (anyone can outbid you).</li>
              <li>Refunds — all payments are final and non-refundable.</li>
              <li>Search-engine ranking or any algorithmic boost outside the board itself.</li>
              <li>Editorial endorsement, certification, or review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Links</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>All outbound links are <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">rel=&quot;sponsored&quot;</code> and pass no PageRank.</li>
              <li>Query parameters are stripped from all outbound clicks.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Payments</h2>
            <ul className="space-y-2 list-disc list-inside text-foreground/80">
              <li>Payments are processed via Dodo Payments.</li>
              <li>All payments are final and non-refundable.</li>
              <li>Card details are collected by Dodo Payments, not by goclaim.space.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}