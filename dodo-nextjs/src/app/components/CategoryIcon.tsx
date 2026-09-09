import React from "react";

type CategoryIconProps = {
  category: string;
  className?: string;
};

export const CATEGORY_COLORS: Record<string, { badgeBg: string; text: string; border: string }> = {
  All: {
    badgeBg: "bg-stone-500/10 dark:bg-stone-400/10",
    text: "text-stone-700 dark:text-stone-300",
    border: "border-stone-500/20",
  },
  "AI Agents & Infrastructure": {
    badgeBg: "bg-purple-500/10 dark:bg-purple-400/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  "Developer Tools": {
    badgeBg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  "Startups & SaaS": {
    badgeBg: "bg-orange-500/10 dark:bg-orange-400/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
  },
  "Marketing & Advertising": {
    badgeBg: "bg-rose-500/10 dark:bg-rose-400/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
  "SEO & AI Visibility": {
    badgeBg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
  },
  "Design & Creative": {
    badgeBg: "bg-pink-500/10 dark:bg-pink-400/10",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500/20",
  },
  "Productivity & Personal Tools": {
    badgeBg: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  "Crypto, Web3 & Investing": {
    badgeBg: "bg-yellow-500/10 dark:bg-yellow-400/10",
    text: "text-yellow-600 dark:text-yellow-500",
    border: "border-yellow-500/20",
  },
  "Business, Finance & Legal": {
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  "Writing & Content": {
    badgeBg: "bg-indigo-500/10 dark:bg-indigo-400/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
  "Social Media & Creator Tools": {
    badgeBg: "bg-red-500/10 dark:bg-red-400/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
  },
  "Security, Privacy & Compliance": {
    badgeBg: "bg-teal-500/10 dark:bg-teal-400/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
  },
  "Health, Fitness & Wellness": {
    badgeBg: "bg-green-500/10 dark:bg-green-400/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/20",
  },
  "Directories, Launch & Discovery": {
    badgeBg: "bg-sky-500/10 dark:bg-sky-400/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
  },
  "Agencies, Studios & Services": {
    badgeBg: "bg-violet-500/10 dark:bg-violet-400/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
  },
  "Hiring, Jobs & Careers": {
    badgeBg: "bg-lime-500/10 dark:bg-lime-400/10",
    text: "text-lime-600 dark:text-lime-400",
    border: "border-lime-500/20",
  },
  "Education & Learning": {
    badgeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-400/10",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    border: "border-fuchsia-500/20",
  },
  "Domains & Web Assets": {
    badgeBg: "bg-blue-600/10 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-600/20",
  },
  Other: {
    badgeBg: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
};

export default function CategoryIcon({
  category,
  className = "size-4",
}: CategoryIconProps) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": "true" as const,
  };

  switch (category) {
    case "All":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
        </svg>
      );

    case "AI Agents & Infrastructure":
      return (
        <svg {...commonProps}>
          <path d="M12 2v3" />
          <rect width="16" height="12" x="4" y="5" rx="3" />
          <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
          <path d="M10 14h4" />
          <path d="M2 11h2" />
          <path d="M20 11h2" />
          <path d="M8 17v4" />
          <path d="M16 17v4" />
        </svg>
      );

    case "Developer Tools":
      return (
        <svg {...commonProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );

    case "Startups & SaaS":
      return (
        <svg {...commonProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );

    case "Marketing & Advertising":
      return (
        <svg {...commonProps}>
          <path d="m3 11 15-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          <path d="M18 9c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4" />
        </svg>
      );

    case "SEO & AI Visibility":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
        </svg>
      );

    case "Design & Creative":
      return (
        <svg {...commonProps}>
          <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.7-.77 1.7-1.7 0-.44-.18-.85-.46-1.16-.28-.31-.44-.72-.44-1.14 0-.93.77-1.7 1.7-1.7H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
        </svg>
      );

    case "Productivity & Personal Tools":
      return (
        <svg {...commonProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );

    case "Crypto, Web3 & Investing":
      return (
        <svg {...commonProps}>
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
          <path d="M3 7l9 5 9-5" />
          <path d="M12 12v10" />
        </svg>
      );

    case "Business, Finance & Legal":
      return (
        <svg {...commonProps}>
          <rect width="20" height="14" x="2" y="7" rx="2.5" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M2 12h20" />
          <path d="M10 12v2a2 2 0 0 0 4 0v-2" />
        </svg>
      );

    case "Writing & Content":
      return (
        <svg {...commonProps}>
          <path d="m18 2 4 4-12 12H6v-4L18 2z" />
          <path d="m14 6 4 4" />
          <path d="M4 20h16" />
        </svg>
      );

    case "Social Media & Creator Tools":
      return (
        <svg {...commonProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );

    case "Security, Privacy & Compliance":
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "Health, Fitness & Wellness":
      return (
        <svg {...commonProps}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.2 12H7l2-4 3 8 2-4h6.8" />
        </svg>
      );

    case "Directories, Launch & Discovery":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );

    case "Agencies, Studios & Services":
      return (
        <svg {...commonProps}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M8 10h.01" />
          <path d="M16 10h.01" />
          <path d="M8 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      );

    case "Hiring, Jobs & Careers":
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case "Education & Learning":
      return (
        <svg {...commonProps}>
          <path d="M22 10v6" />
          <path d="M2 10l10-5 10 5-10 5z" />
          <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
      );

    case "Domains & Web Assets":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );

    case "Other":
      return (
        <svg {...commonProps}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      );
  }
}
