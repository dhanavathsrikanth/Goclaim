export default function FAQPage() {
  const faqs = [
    {
      q: "What is goclaim.space?",
      a: "A public leaderboard where position is determined by how much you pay. There are no third-party ads, no API keys, and no revenue sharing. Just outbid your competitors to rank #1.",
    },
    {
      q: "How do I get on the board?",
      a: "Submit a product URL or X handle, enter a bid amount, and pay. A completed payment claims the rank. New listings start at $2.",
    },
    {
      q: "How much does it cost?",
      a: "Bids are whole US dollars, $2 minimum, $999,999 maximum. Taking #1 costs at least $5 more than the current #1. If you are already on the board, you only pay the difference to raise your rank.",
    },
    {
      q: "How do I take #1?",
      a: "Pay at least $5 more than whoever is currently #1 on that board.",
    },
    {
      q: "What boards are there?",
      a: "All-time (cumulative lifetime spend, never expires), Today (rolling 24-hour spend window), Daily (UTC calendar day, midnight to midnight), and category-specific boards.",
    },
    {
      q: "Can I raise my rank after paying?",
      a: "Yes. Enter the same URL or @handle again. The new amount must be at least $1 above your current total, and you only pay the difference.",
    },
    {
      q: "What payment method do you accept?",
      a: "Checkout runs through Dodo Payments. You choose a whole-dollar amount, accept the terms, and pay. Card details are collected by Dodo Payments, not by goclaim.space.",
    },
    {
      q: "Do ranks expire?",
      a: "All-time ranks do not expire. Today ranks drop off 24 hours after each payment. Daily ranks close at the end of that UTC calendar day — and each day's #1 is immortalized in the Hall of Fame.",
    },
    {
      q: "Are there refunds?",
      a: "No. All payments are final and non-refundable, even if you are outranked, get fewer clicks than hoped, or the listing is later removed for rule violations.",
    },
    {
      q: "Is there a free way to try it?",
      a: "Yes — promo codes like EARLY100 cover a $2 starter listing for free. Limits: 1 free per domain/handle, 1 per email, new listings only. Free listings rank at $2 and any paid bid can outrank them.",
    },
    {
      q: "Is this a scam? Do I get customers?",
      a: "No scam, but no promises either. You pay for a public rank — not for traffic, customers, or revenue. Anyone can outbid you at any time, and all payments are final. Rank signals who paid most, nothing more.",
    },
    {
      q: "What content is banned?",
      a: "Scams, phishing, malware, adult sexual content, hate, violent extremism, impersonation, and chat/invite links. We remove violations without refund. Report abuse via the contact channel on the About page.",
    },
    {
      q: "What data do you keep?",
      a: "Listings, bids, and clicks are public by design. Claim emails stay private and are only used for your dashboard link and coupon-limit enforcement. Payments run through Dodo Payments — we never see your card. Details in the Privacy Policy.",
    },
    {
      q: "Is this an endorsement or recommendation?",
      a: "No. goclaim.space is not a launch vote. There is no upvote, no hunter, and no review queue. Rank is only what you pay. The board is public, rankings stay visible, and one payment counts across All-time, Today, and Daily windows.",
    },
  ];

  return (
    <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">FAQ</h1>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border pb-6 last:border-0">
              <h3 className="text-foreground font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}