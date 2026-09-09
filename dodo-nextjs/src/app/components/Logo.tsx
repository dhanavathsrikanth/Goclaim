"use client";

type Props = {
  className?: string;
  showText?: boolean;
};

export default function Logo({ className = "size-6", showText = false }: Props) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="navGcGrad" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#D97757" />
            <stop offset="70%" stop-color="#E57255" />
            <stop offset="100%" stop-color="#FF8A65" />
          </linearGradient>
        </defs>

        {/* Monogram G Arc */}
        <path
          d="M24.8 11.8C23.2 7.8 19.5 5 15.2 5C9.2 5 4.2 9.9 4.2 16C4.2 22.1 9.2 27 15.2 27C21 27 25.8 22.8 26.2 17.2H16.2V13.6H28.2V16.2C28.2 23.6 22.3 29.4 15.2 29.4C7.8 29.4 1.8 23.4 1.8 16C1.8 8.6 7.8 2.6 15.2 2.6C20.6 2.6 25.4 5.8 27.6 10.5L24.8 11.8Z"
          fill="url(#navGcGrad)"
        />

        {/* Upward Outbid Arrow */}
        <path
          d="M16.5 15.5L27.5 4.5M27.5 4.5H20.5M27.5 4.5V11.5"
          className="stroke-foreground dark:stroke-white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Spark Pip */}
        <circle cx="27.5" cy="4.5" r="1.5" fill="#FF8A65" />
      </svg>

      {showText && (
        <span className="font-semibold tracking-[-0.04em] text-foreground text-lg">
          goclaim<span className="text-primary">.</span>space
        </span>
      )}
    </span>
  );
}
