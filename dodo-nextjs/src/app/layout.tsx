import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DataFast from "./components/DataFast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "goclaim.space — Claim a rank on the public leaderboard",
  description:
    "No third-party ads, no API keys, no revenue sharing. Claim a rank on the public leaderboard and take #1.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

function ThemeScript() {
  const code = `((a,b,c,d,e,f,g,h)=>{let i=document.documentElement,j=["light","dark"];function k(b){var c;(Array.isArray(a)?a:[a]).forEach(a=>{let c="class"===a,d=c&&f?e.map(a=>f[a]||a):e;c?(i.classList.remove(...d),i.classList.add(f&&f[b]?f[b]:b)):i.setAttribute(a,b)}),c=b,h&&j.includes(c)&&(i.style.colorScheme=c)}if(d)k(d);else try{let a=localStorage.getItem(b)||c,d=g&&"system"===a?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":a;k(d)}catch(a){}})("class","theme","light",null,["light","dark"],null,false,true)`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#fffdfa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#2c2a26" media="(prefers-color-scheme: dark)" />
        {/* Privacy-friendly analytics by Plausible */}
        <script async src="https://plausible.io/js/pa-izb-P8HiYs4tFLVQTWViV.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <ThemeScript />
        <DataFast />
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
