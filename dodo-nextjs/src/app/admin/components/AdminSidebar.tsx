"use client";

import Link from "next/link";
import { useState } from "react";
import SignOutButton from "./SignOutButton";

interface AdminSidebarProps {
  adminEmail: string;
}

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "#overview", icon: "📊" },
    { label: "Viral", href: "#viral", icon: "🔥" },
    { label: "Ops", href: "#ops", icon: "🛠️" },
    { label: "Creatives", href: "#creatives", icon: "🎨" },
    { label: "Monitoring", href: "#monitoring", icon: "🚨" },
    { label: "Analytics", href: "#analytics", icon: "📈" },
    { label: "Composio Social", href: "#social", icon: "⚡" },
    { label: "Listings", href: "#listings", icon: "📑" },
    { label: "Payments", href: "#payments", icon: "💳" },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1E1D1B] border-b border-[#33322E] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D97757] text-white flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
          <span className="font-bold text-white tracking-tight text-sm">
            Goclaim Console
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#9E9C96] hover:text-white rounded-lg border border-[#33322E] bg-[#242320] text-sm cursor-pointer"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Admin Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#1E1D1B] border-r border-[#33322E] flex flex-col justify-between z-50 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#D97757] text-white flex items-center justify-center font-bold text-base shadow-sm">
              ⚡
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block leading-none">
                Goclaim Admin
              </span>
              <span className="text-[10px] text-[#D97757] font-semibold tracking-wider uppercase block mt-1">
                Neon Auth Verified
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9C96] px-3 mb-2">
              Navigation
            </p>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#9E9C96] hover:text-white hover:bg-[#282724] transition-colors"
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#33322E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E9C96] px-3 mb-2">
              Shortcuts
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#9E9C96] hover:text-white hover:bg-[#282724] transition-colors"
            >
              <span>View Public Site</span>
              <span className="text-sm">↗</span>
            </Link>
          </div>
        </div>

        {/* Docked Profile & Sign Out at Bottom */}
        <div className="p-4 m-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#D97757]/20 border border-[#D97757]/30 text-[#D97757] flex items-center justify-center font-bold text-xs">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {adminEmail}
              </p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Authenticated</span>
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
