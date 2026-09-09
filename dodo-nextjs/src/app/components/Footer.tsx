import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 pb-8 text-center">
      <p className="text-sm text-muted-foreground">
        Rank is the bid — nothing else. Whole US dollars only.
      </p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted-foreground">
        <Link href="/rules" className="font-medium text-primary hover:text-primary/80">
          Rules
        </Link>
        <span>·</span>
        <Link href="/faq" className="font-medium text-primary hover:text-primary/80">
          FAQ
        </Link>
        <span>·</span>
        <Link href="/about" className="font-medium text-primary hover:text-primary/80">
          About
        </Link>
        <span>·</span>
        <Link href="/?board=daily" className="font-medium text-primary hover:text-primary/80">
          Daily
        </Link>
        <span>·</span>
        <Link href="/hall-of-fame" className="font-medium text-primary hover:text-primary/80">
          Hall of Fame
        </Link>
        <span>·</span>
        <Link href="/stats" className="font-medium text-primary hover:text-primary/80">
          Stats
        </Link>
        <span>·</span>
        <Link href="/activity" className="font-medium text-primary hover:text-primary/80">
          Activity
        </Link>
        <span>·</span>
        <span className="text-muted-foreground font-normal">
          © {new Date().getFullYear()} goclaim.space
        </span>
      </nav>
    </footer>
  );
}
