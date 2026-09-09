import type { Listing, BoardType } from "./types";

export function rankListings(listings: Listing[], board: BoardType): Listing[] {
  const confirmed = listings.filter((l) => l.status === "confirmed");

  switch (board) {
    case "all-time":
      return sortByRank(confirmed);

    case "today": {
      const now = Date.now();
      const within24h = confirmed.filter((l) => {
        const listingTime = new Date(l.created_at).getTime();
        return now - listingTime < 24 * 60 * 60 * 1000;
      });
      return sortByRank(within24h);
    }

    case "daily": {
      const todayStart = getUTCDayStart();
      const todayEnd = getUTCDayEnd();
      const todayListings = confirmed.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= todayStart && t < todayEnd;
      });
      return sortByRank(todayListings);
    }

    default:
      return sortByRank(confirmed);
  }
}

function sortByRank(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    if (b.total_bid !== a.total_bid) {
      return b.total_bid - a.total_bid;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export function getRank(
  listings: Listing[],
  targetId: string,
  board: BoardType
): number {
  const ranked = rankListings(listings, board);
  return ranked.findIndex((l) => l.id === targetId) + 1;
}

export function getCurrentTopBid(listings: Listing[]): number {
  const confirmed = listings.filter((l) => l.status === "confirmed");
  if (confirmed.length === 0) return 0;
  return Math.max(...confirmed.map((l) => l.total_bid));
}

function getUTCDayStart(): number {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  );
  return start.getTime();
}

function getUTCDayEnd(): number {
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return end.getTime();
}
