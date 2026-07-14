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
            <div className="mt-6 flex flex-col gap-2 text-sm text-neutral-400">
              <a href="https://datasds.org" className="font-mono text-signal transition-colors hover:text-white">
                datasds.org
              </a>
              <a href="mailto:contact@datasds.org" className="transition-colors hover:text-signal">
                contact@datasds.org
              </a>
              <a href="mailto:info@datasds.org" className="transition-colors hover:text-signal">
                info@datasds.org
              </a>
              <a href="mailto:accounts@datasds.org" className="transition-colors hover:text-signal">
                accounts@datasds.org
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
              href="https://medium.com/@Ric_Royal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-400 transition-colors hover:text-signal"
              aria-label="Read Ric-Royal on Medium"
            >
              Medium / @Ric_Royal ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
