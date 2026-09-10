"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors cursor-pointer"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-muted border border-border text-foreground font-medium hover:text-foreground transition-colors"
            >
              ← Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}