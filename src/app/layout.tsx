import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

const headingFont = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = JetBrains_Mono({
  variable: "--font-mono",
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
      <body className="theme-catppuccin">
        <AppNav />
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
