"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Leaderboard", href: "/", icon: "🏆" },
    { label: "Rules", href: "/rules", icon: "📜" },
    { label: "FAQ", href: "/faq", icon: "❓" },
    { label: "About", href: "/about", icon: "ℹ️" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#F4F3ED]/95 backdrop-blur-md border-b border-[#E5E4DE] px-4 flex items-center justify-between z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D97757] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            ⚡
          </div>
          <span className="font-bold text-[#1F1E1D] tracking-tight">
            goclaim<span className="text-[#96948E]">.space</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
          className="p-2 text-[#6B6964] hover:text-[#1F1E1D] rounded-lg border border-[#E5E4DE] bg-white cursor-pointer"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#F4F3ED] border-r border-[#E5E4DE] flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Branding & Nav */}
        <div className="p-6">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 mb-8 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D97757] group-hover:bg-[#C15F3D] text-white flex items-center justify-center font-bold text-base shadow-sm transition-colors">
              ⚡
            </div>
            <div>
              <span className="font-bold text-[#1F1E1D] text-lg tracking-tight block leading-none">
                goclaim<span className="text-[#96948E]">.space</span>
              </span>
              <span className="text-[11px] text-[#96948E] font-medium tracking-wide block mt-1">
                Attention Market
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#FAF9F5] text-[#1F1E1D] shadow-xs border border-[#E5E4DE] font-semibold"
                      : "text-[#6B6964] hover:text-[#1F1E1D] hover:bg-[#FAF9F5]/60"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D97757]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Middle / Info Block */}
        <div className="px-6 py-4">
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E4DE] text-xs">
            <div className="flex items-center gap-2 text-[#D97757] font-semibold uppercase tracking-wider text-[10px] mb-1.5">
              <span>👑</span>
              <span>The Platform Rule</span>
            </div>
            <p className="text-[#6B6964] leading-relaxed">
              Rank is strictly what you pay — nothing else. Own your spot by outbidding the competition.
            </p>
          </div>
        </div>

        {/* Bottom Status Footer */}
        <div className="p-6 border-t border-[#E5E4DE]">
          <div className="flex items-center gap-2 text-xs text-[#6B6964]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97757] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97757]"></span>
            </span>
            <span className="font-medium text-[#1F1E1D]">Live Bidding System</span>
          </div>
          <p className="text-[11px] text-[#96948E] mt-1.5">
            Bids are US dollars. Links are sponsored.
          </p>
        </div>
      </aside>
    </>
  );
}
