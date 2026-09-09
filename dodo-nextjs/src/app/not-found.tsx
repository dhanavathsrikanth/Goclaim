import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 w-full pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center py-16">
          <h1 className="text-4xl font-bold text-foreground mb-3">404</h1>
          <p className="text-muted-foreground mb-8">
            This page doesn&apos;t exist or was moved.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors"
          >
            ← Back to the board
          </Link>
        </div>
      </div>
    </div>
  );
}