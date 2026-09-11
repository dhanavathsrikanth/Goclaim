export type Listing = {
  id: string;
  url: string;
  normalized_url: string;
  product_name: string;
  description: string;
  favicon_url: string;
  category: string;
  total_bid: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  status: "pending" | "confirmed" | "removed";
  claim_email: string;
  banner_url: string;
  logo_url: string;
  slug: string;
  creative_approved: boolean;
  promo_code?: string;
  promo_offer?: string;
  demo_url?: string;
  founder_note?: string;
};

export type Payment = {
  id: string;
  listing_id: string;
  checkout_session_id: string;
  amount: number;
  status: "pending" | "confirmed" | "failed" | "refunded";
  created_at: string;
  coupon_code?: string;
};

export type Coupon = {
  code: string;
  max_uses: number;
  uses: number;
  amount: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type BoardType = "all-time" | "today" | "daily";

export const CATEGORIES = [
  "All",
  "AI Agents & Infrastructure",
  "Developer Tools",
  "Startups & SaaS",
  "Marketing & Advertising",
  "SEO & AI Visibility",
  "Design & Creative",
  "Productivity & Personal Tools",
  "Crypto, Web3 & Investing",
  "Business, Finance & Legal",
  "Writing & Content",
  "Social Media & Creator Tools",
  "Security, Privacy & Compliance",
  "Health, Fitness & Wellness",
  "Directories, Launch & Discovery",
  "Agencies, Studios & Services",
  "Hiring, Jobs & Careers",
  "Education & Learning",
  "Domains & Web Assets",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type SponsorEntry = {
  snapshot_date: string;
  rank: number;
  listing_id: string;
  total_bid: number;
  product_name: string;
  favicon_url: string;
  url: string;
  banner_url: string;
  creative_approved: boolean;
};

export type HallEntry = {
  snapshot_date: string;
  listing_id: string;
  total_bid: number;
  product_name: string;
  favicon_url: string;
  logo_url: string;
  url: string;
  slug: string;
  clicks_during_slot: number;
};

export type PublicStats = {
  revenue: number;
  listings: number;
  clicks: number;
  top_bid: number;
  categories: number;
};

export type ActivityItem = {
  kind: "bid" | "join" | "crown";
  at: string;
  listing_id: string;
  product_name: string;
  slug: string;
  amount: number;
};

export type DayClickCount = {
  day: string;
  clicks: number;
};

export type ReferralSourceBreakdown = {
  source: string;
  label: string;
  count: number;
  percentage: number;
  icon?: string;
  color?: string;
};

export type RoiMetrics = {
  total_bid: number;
  total_clicks: number;
  effective_cpc: number;
  benchmark_cpc: number;
  savings_pct: number;
  estimated_market_value: number;
  roi_multiple: number;
  callout_text: string;
};

