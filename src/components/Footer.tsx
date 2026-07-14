import Link from "next/link";

const footerLinks = {
  Company: [
    { href: "/about", label: "About SDS" },
    { href: "/services", label: "Services" },
    { href: "/solutions", label: "Solutions" },
    { href: "/work", label: "Our Work" },
  ],
  Resources: [
    { href: "/insights", label: "Insights" },
    { href: "/contact", label: "Contact" },
  ],
  Services: [
    { href: "/services#analytics", label: "Data Analytics & BI" },
    { href: "/services#ai", label: "Applied AI & NLP" },
    { href: "/services#research", label: "Research & Advisory" },
    { href: "/services#risk", label: "Risk & Compliance" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-dark text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center border border-signal bg-signal text-[11px] font-bold tracking-[-0.08em] text-slate-dark">
                S/
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">
                SDS
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Decision intelligence and applied systems for organisations operating where the stakes are real.
            </p>
            <div className="mt-6 flex flex-col gap-1 text-sm text-neutral-400">
              <a href="https://datasds.org" className="font-mono text-signal transition-colors hover:text-white">
                datasds.org
              </a>
              <a href="mailto:info@sdscompany.com" className="transition-colors hover:text-signal">
                info@sdscompany.com
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-300">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-signal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">
            &copy; {new Date().getFullYear()} SDS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors hover:text-signal"
              aria-label="LinkedIn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
