export default function AboutPage() {
  return (
    <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">About</h1>

        <div className="space-y-6 text-foreground/80 text-sm leading-relaxed">
          <p>
            goclaim.space started as a simple side project: no third-party ads, no API keys, no revenue sharing.
            Just outbid your competitors to rank #1 — that&apos;s it.
          </p>

          <p>
            The idea is brutally simple. You submit a product URL or X handle, pay a whole-dollar
            bid, and sit above everyone who paid less. Higher payment = higher rank. That&apos;s the
            entire product.
          </p>

          <p>
            The board is public. Rankings stay visible. One payment counts across All-time, Today,
            and Daily windows. If someone outbids you, you can pay more to take your spot back.
          </p>

          <p>
            This is not an endorsement. There is no editorial review, no vetting, no recommendation
            algorithm. A leaderboard sorted by payment tells you who had budget — nothing more.
          </p>

          <div className="border border-border bg-card rounded-xl p-6 mt-8 shadow-sm">
            <p className="text-foreground font-semibold mb-2">The rules are simple:</p>
            <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
              <li>You pay to stand above everyone else.</li>
              <li>Rank is what you pay — nothing else.</li>
              <li>All payments are final.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}