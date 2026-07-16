import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "SDS research briefs and selected writing on financial intelligence, strategic analysis, data quality, and applied AI.",
};

const archive = [
  {
    title: "From a Trends and Typologies Report to a Full Strategic Analysis Product",
    category: "Strategic analysis",
    date: "11 Mar 2026",
    readingTime: "10 min read",
    href: "https://medium.com/@Ric_Royal/from-a-trends-and-typologies-report-to-a-full-strategic-analysis-product-c21fe88840a2",
    excerpt:
      "How ranked threats, visible methodology, confidence statements, and assigned actions turn analysis into a product leaders can use.",
  },
  {
    title: "Ensuring Data Quality in Kenyan AML/CFT/CPF Reporting",
    category: "Data governance",
    date: "4 Oct 2025",
    readingTime: "4 min read",
    href: "https://medium.com/@Ric_Royal/ensuring-data-quality-in-kenyan-aml-cft-cpf-reporting-9d60fa4c7686",
    excerpt:
      "Eight data-quality dimensions translated into concrete reporting checks for stronger regulatory intelligence.",
  },
  {
    title: "Graph Network Analysis for Anti-Money Laundering Powered by Large Language Models",
    category: "Applied AI",
    date: "29 Mar 2025",
    readingTime: "5 min read",
    href: "https://medium.com/@Ric_Royal/graph-network-analysis-for-anti-money-laundering-powered-by-large-language-models-0cbe6aa6db5f",
    excerpt:
      "A build story combining transaction graphs, network measures, visual analysis, and a local language model.",
  },
];

export default function InsightsPage() {
  return (
    <>
      <section className="system-grid border-b border-white/10 bg-slate-dark py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">
              SDS research + analysis
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Evidence for decisions that cannot run on instinct.
            </h1>
          </div>
          <div className="flex flex-col justify-end lg:col-span-4">
            <p className="max-w-md text-base leading-relaxed text-neutral-300">
              Our briefs separate what changed from what it means in practice. They are built for leaders who need to test controls, challenge assumptions, and decide what happens next.
            </p>
            <div className="mt-8 grid grid-cols-2 border border-white/20 font-mono text-[10px] uppercase tracking-[0.12em]">
              <div className="border-r border-white/20 p-4">
                <span className="block text-neutral-500">Current issue</span>
                <span className="mt-2 block text-signal">East Africa AML/CFT</span>
              </div>
              <div className="p-4">
                <span className="block text-neutral-500">Formats</span>
                <span className="mt-2 block text-white">Read / listen / PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="paper-grid border-b border-neutral-300 bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-6 border-b border-neutral-300 pb-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">Latest SDS brief</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">A full research experience, not a document preview.</h2>
            </div>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500 sm:block">Issue 01 / 13 July 2026</span>
          </div>

          <div className="grid border border-slate-dark bg-white lg:grid-cols-12">
            <div className="system-grid flex min-h-[570px] flex-col justify-between bg-slate-dark p-7 text-white sm:p-10 lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-3 border border-white/20 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-300">
                  <span className="h-2 w-2 bg-signal" /> East Africa AML/CFT brief
                </span>
                <span className="font-mono text-xs text-white/50">01</span>
              </div>

              <div className="my-20">
                <div className="mb-9 flex h-24 items-end gap-2" aria-hidden>
                  {[42, 58, 48, 72, 62, 88, 78, 100].map((height, index) => (
                    <span key={`${height}-${index}`} className="w-5 bg-signal/75" style={{ height: `${height}%` }} />
                  ))}
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">Grey-list remediation / virtual assets / intelligence</p>
                <h3 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.88] tracking-[-0.06em] sm:text-7xl">
                  EAST AFRICA&apos;S AML/CFT TEST IS <span className="text-signal">NOW EXECUTION.</span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                <span>Richard Kabiru / SDS analysis</span>
                <span>8-page edition</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">Why this matters</p>
                <p className="mt-6 font-serif text-2xl leading-relaxed text-foreground">
                  The rules are becoming clearer. The harder question is whether institutions can prove that policy changes what they detect and how they respond.
                </p>
                <p className="mt-6 text-sm leading-relaxed text-neutral-600">
                  The interactive edition examines grey-list remediation, indirect virtual-asset exposure, STR quality, terrorist-financing networks, and the controls institutions can measure now.
                </p>

                <div className="mt-8 grid gap-px bg-neutral-300 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    ["Read", "Interactive chapters"],
                    ["Listen", "1:41 brief + 21:47 debate"],
                    ["Keep", "Downloadable PDF"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-neutral-50 p-4">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-jungle">{label}</span>
                      <span className="mt-2 block text-xs leading-relaxed text-neutral-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 space-y-3">
                <Link
                  href="/insights/east-africa-aml-cft-execution"
                  className="flex items-center justify-between border border-slate-dark bg-slate-dark px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jungle"
                >
                  Read the interactive brief <span aria-hidden>→</span>
                </Link>
                <a
                  href="/research/east-africa-aml-cft-execution-13-july-2026.pdf"
                  download
                  className="flex items-center justify-between border border-neutral-300 px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-jungle hover:text-jungle"
                >
                  Download the PDF <span aria-hidden>↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-neutral-300 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">Earlier field notes</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">Selected writing from the archive.</h2>
            </div>
            <a href="https://medium.com/@Ric_Royal" target="_blank" rel="noopener noreferrer" className="w-fit border-b border-jungle pb-1 text-xs font-bold uppercase tracking-[0.1em] text-jungle hover:border-slate-dark hover:text-slate-dark">
              View the Medium archive ↗
            </a>
          </div>

          <div className="grid border-l border-neutral-300 md:grid-cols-3">
            {archive.map((insight, index) => (
              <article key={insight.title} className="flex min-h-[390px] flex-col justify-between border-b border-r border-neutral-300 bg-white p-6 transition-colors hover:bg-background sm:p-7">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-jungle">{insight.category}</span>
                    <span className="font-mono text-[10px] text-neutral-400">0{index + 2}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground">{insight.title}</h3>
                  <p className="mt-5 text-sm leading-relaxed text-neutral-600">{insight.excerpt}</p>
                </div>
                <div className="mt-10 border-t border-neutral-300 pt-5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500">
                    <span>{insight.date}</span>
                    <span>{insight.readingTime}</span>
                  </div>
                  <a href={insight.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-jungle transition-colors hover:text-slate-dark">
                    Read on Medium <span className="ml-5" aria-hidden>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-signal text-slate-dark">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-5 py-16 sm:flex-row sm:items-end lg:px-8 lg:py-20">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Apply the analysis</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl">
              If the control problem feels familiar, let&apos;s examine your system.
            </h2>
          </div>
          <Link href="/contact" className="inline-flex shrink-0 items-center justify-between gap-16 border border-slate-dark bg-slate-dark px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jungle">
            Start a conversation <span aria-hidden>↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
