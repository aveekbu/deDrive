"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgressStore } from "@/store/progress-store";
import { useSettingsStore } from "@/store/settings-store";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/quiz", label: "Quiz" },
  { href: "/progress", label: "Progress" },
  { href: "/topics", label: "Topics" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydrateProgress = useProgressStore((state) => state.hydrate);

  useEffect(() => {
    hydrateSettings();
    hydrateProgress();
  }, [hydrateProgress, hydrateSettings]);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="DE Drive home">
          <Image src="/registration-logos.svg" alt="Registration logos" width={101} height={48} />
          <span>
            DE Drive
            <small className="brand-subtitle">Theory Coach</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                style={{
                  color: isActive ? "var(--primary-foreground)" : undefined,
                  borderColor: isActive ? "var(--primary)" : undefined,
                  background: isActive ? "var(--primary)" : undefined,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
