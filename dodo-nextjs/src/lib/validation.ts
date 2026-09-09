import { getListings } from "./data";
import { getCurrentTopBid } from "./ranking";
import { normalizeUrl, isValidUrlOrDomain } from "./normalize";

export type BidError =
  | "INVALID_AMOUNT"
  | "AMOUNT_TOO_LOW"
  | "AMOUNT_NOT_WHOLE"
  | "AMOUNT_TOO_HIGH"
  | "AMOUNT_BELOW_TOP_BID"
  | "TOP_BID_INSUFFICIENT"
  | "URL_NOT_ALLOWED"
  | "INVALID_URL";

export type BidValidation = {
  ok: boolean;
  error?: BidError;
  amountToPay?: number;
  isNewListing?: boolean;
  isRebid?: boolean;
};

export async function validateBid(
  urlInput: string,
  amount: number
): Promise<BidValidation> {
  if (!isValidUrlOrDomain(urlInput)) {
    return { ok: false, error: "INVALID_URL" };
  }

  const normalizedUrl = normalizeUrl(urlInput);

  if (!normalizedUrl || normalizedUrl.length < 3) {
    return { ok: false, error: "INVALID_URL" };
  }

  if (isBlockedHost(normalizedUrl)) {
    return { ok: false, error: "URL_NOT_ALLOWED" };
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, error: "AMOUNT_NOT_WHOLE" };
  }

  if (amount < 2) {
    return { ok: false, error: "AMOUNT_TOO_LOW" };
  }

  if (amount > 999999) {
    return { ok: false, error: "AMOUNT_TOO_HIGH" };
  }

  const listings = await getListings();
  const existing = listings.find(
    (l) => l.normalized_url === normalizedUrl && l.status === "confirmed"
  );

  if (existing) {
    const diff = amount - existing.total_bid;
    if (diff < 1) {
      return { ok: false, error: "AMOUNT_BELOW_TOP_BID" };
    }
    return {
      ok: true,
      amountToPay: diff,
      isNewListing: false,
      isRebid: true,
    };
  }

  const topBid = getCurrentTopBid(listings);

  if (topBid > 0 && amount <= topBid) {
    return { ok: true, amountToPay: amount, isNewListing: true, isRebid: false };
  }

  if (topBid > 0 && amount > topBid && amount < topBid + 5) {
    return { ok: false, error: "TOP_BID_INSUFFICIENT" };
  }

  return {
    ok: true,
    amountToPay: amount,
    isNewListing: true,
    isRebid: false,
  };
}

// Chat and invite links are not listable (see Rules). Matches the URL's
// host or any parent domain, e.g. t.me, chat.whatsapp.com, discord.gg.
const BLOCKED_HOSTS = [
  "telegram.me",
  "t.me",
  "whatsapp.com",
  "chat.whatsapp.com",
  "discord.gg",
  "discord.com",
  "messenger.com",
  "m.me",
  "signal.me",
];

export function isBlockedHost(normalizedUrl: string): boolean {
  let host = "";
  try {
    host = new URL(
      normalizedUrl.startsWith("http") ? normalizedUrl : `https://${normalizedUrl}`
    ).hostname.toLowerCase();
  } catch {
    return false;
  }
  return BLOCKED_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`)
  );
}
