import type { Metadata } from "next";
import { Anybody, Azeret_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const azeretMono = Azeret_Mono({
  variable: "--font-azeret",
  subsets: ["latin"],
  display: "swap",
});

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "./fonts/satoshi-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi-bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Ralph Ethan De Guzman",
  description:
    "Software engineer building full-stack web and cloud systems.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anybody.variable} ${azeretMono.variable} ${satoshi.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-paper"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
