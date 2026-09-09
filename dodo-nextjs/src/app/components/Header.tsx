"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 transition-colors cursor-pointer"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 pt-6 gap-3 pb-3.5 md:pb-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-[-0.04em] shrink-0 text-[22px] group"
          >
            <Logo className="size-6 transition-transform group-hover:scale-105" />
            <span className="sr-only md:not-sr-only font-bold tracking-tight">
              goclaim<span className="text-primary">.</span>space
            </span>
          </Link>

          <nav aria-label="Main">
            <ul className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
              <li>
                <Link href="/?board=daily" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Daily
                </Link>
              </li>
              <li className="hidden md:block">
                <Link href="/#leaderboard" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li className="hidden md:block">
                <Link href="/about" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/rules" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Rules
                </Link>
              </li>
              <li>
                <Link href="/faq" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li className="hidden md:block">
                <Link href="/hall-of-fame" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                  🏆 Winners
                </Link>
              </li>
              <li className="flex items-center gap-1">
                <a
                  href="#leaderboard"
                  aria-label="Search"
                  className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                  </svg>
                </a>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
