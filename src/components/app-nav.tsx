"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/quiz", label: "Quiz" },
  { href: "/progress", label: "Progress" },
  { href: "/topics", label: "Topics" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          DE Driving Theory
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
                  color: isActive ? "var(--ink)" : undefined,
                  borderColor: isActive ? "var(--accent)" : undefined,
                  background: isActive ? "#e9fbf9" : undefined,
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
