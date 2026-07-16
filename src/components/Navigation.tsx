"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/solutions", label: "Solutions" },
  { href: "/work", label: "Work" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-300 bg-background/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="SDS home">
          <div className="flex h-9 w-9 items-center justify-center border border-slate-dark bg-slate-dark text-[11px] font-bold tracking-[-0.08em] text-signal transition-colors group-hover:bg-jungle">
            S/
          </div>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold tracking-[-0.04em] text-slate-dark">SDS</span>
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-500">Data systems</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors after:absolute after:inset-x-0 after:-bottom-3 after:h-px after:origin-left after:bg-jungle after:transition-transform ${
                isActive(link.href)
                  ? "text-jungle after:scale-x-100"
                  : "text-neutral-600 after:scale-x-0 hover:text-foreground hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/contact"
          className="hidden border border-slate-dark bg-slate-dark px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:border-jungle hover:bg-jungle md:block"
        >
          Start a project ↗
        </Link>

        <button
          className="flex h-10 w-10 items-center justify-center border border-neutral-300 text-neutral-700 hover:border-jungle hover:text-jungle md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-neutral-300 bg-background px-5 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`border-b border-neutral-200 px-0 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive(link.href)
                    ? "text-jungle"
                    : "text-neutral-600 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-slate-dark px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white"
            >
              Start a project ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
