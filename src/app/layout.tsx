import type { Metadata } from "next";
import { JetBrains_Mono, Michroma } from "next/font/google";
import "./globals.css";

import { CursorGrid } from "@/components/cursor-grid";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ethan — Software Engineer",
  description:
    "Full-stack engineer building Laravel, TypeScript, and AWS systems, from AI-assisted clinical tooling to property management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${michroma.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-fg focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-bg"
        >
          Skip to content
        </a>
        <CursorGrid />
        <Nav />
        <main id="main" className="relative z-10 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
