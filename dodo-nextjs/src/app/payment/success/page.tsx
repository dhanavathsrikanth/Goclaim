"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PaymentSuccess() {
  const [listingId, setListingId] = useState("");
  const [payId, setPayId] = useState("");
  const [state, setState] = useState<"loading" | "pending" | "ready" | "error">(
    "loading"
  );
  const [claimToken, setClaimToken] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setListingId(q.get("listing") ?? "");
    setPayId(q.get("pay") ?? "");
  }, []);

  useEffect(() => {
    if (!listingId || !payId) {
      setState("error");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/payment/claim?listing=${encodeURIComponent(listingId)}&pay=${encodeURIComponent(payId)}`
        );
        if (res.status === 404 || res.status === 400) {
          if (!cancelled) setState("error");
          return;
        }
        const data = await res.json();
        if (data.claim_token) {
          if (!cancelled) {
            setClaimToken(data.claim_token);
            setState("ready");
          }
          return;
        }
      } catch {
        // keep polling
      }
      if (!cancelled) {
        setState("pending");
        if (attempts < 40) setTimeout(poll, 3000);
        else setState("error");
      }
    };

    setState("loading");
    poll();
    return () => {
      cancelled = true;
    };
  }, [listingId, payId]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          {state === "ready" ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                Payment confirmed 🎉
              </h1>
              <p className="text-muted-foreground mb-8">
                Your bid is live on the board. Your personal dashboard link
                below is the only way to manage these listings — bookmark it.
              </p>
              <Link
                href={`/dashboard?claim=${encodeURIComponent(claimToken)}`}
                className="inline-block px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors"
              >
                Open your dashboard →
              </Link>
            </>
          ) : state === "error" ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                Couldn&apos;t confirm payment
              </h1>
              <p className="text-muted-foreground mb-8">
                This link is invalid, or the payment confirmation hasn&apos;t
                arrived yet. If you just paid, wait a minute and refresh — or
                check the leaderboard for your listing.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/70 transition-colors"
              >
                ← Back to the board
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                Confirming payment…
              </h1>
              <p className="text-muted-foreground mb-8">
                Waiting for the payment confirmation to arrive. This usually
                takes a few seconds — keep this tab open.
              </p>
              <div className="mx-auto w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
