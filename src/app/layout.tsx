import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = IBM_Plex_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DE Driving Theory",
  description: "Interactive driving theory practice with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <AppNav />
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
