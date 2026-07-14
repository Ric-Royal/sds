import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Selected writing from SDS on strategic analysis, data quality, applied AI, financial crime, and technical product development.",
};

const insights = [
  {
    title: "From a Trends and Typologies Report to a Full Strategic Analysis Product",
    category: "Strategic analysis",
    date: "11 Mar 2026",
    readingTime: "10 min read",
    href: "https://medium.com/@Ric_Royal/from-a-trends-and-typologies-report-to-a-full-strategic-analysis-product-c21fe88840a2",
    excerpt:
      "A practical case for moving beyond descriptive reporting. The article shows how ranked threats, visible methodology, confidence statements, and assigned actions turn analysis into a product leaders can use.",
    relevance: "For leaders who need analysis to direct priorities, not simply describe activity.",
  },
  {
    title: "Ensuring Data Quality in Kenyan AML/CFT/CPF Reporting",
    category: "Data governance",
    date: "4 Oct 2025",
    readingTime: "4 min read",
    href: "https://medium.com/@Ric_Royal/ensuring-data-quality-in-kenyan-aml-cft-cpf-reporting-9d60fa4c7686",
    excerpt:
      "Eight data-quality dimensions, translated into concrete reporting checks. It explains why reliable analysis starts long before a dashboard or model sees the data.",
    relevance: "For compliance and data teams improving the evidence behind regulatory reporting.",
  },
  {
    title: "Graph Network Analysis for Anti-Money Laundering Powered by Large Language Models",
    category: "Applied AI",
    date: "29 Mar 2025",
    readingTime: "5 min read",
    href: "https://medium.com/@Ric_Royal/graph-network-analysis-for-anti-money-laundering-powered-by-large-language-models-0cbe6aa6db5f",
    excerpt:
      "A build story combining transaction graphs, network measures, visual analysis, and a local language model to surface suspicious patterns and help analysts interpret them.",
    relevance: "For risk teams evaluating where AI can support, rather than replace, analyst judgment.",
  },
  {
    title: "Building a Composite Laminate Analysis App in Python",
    category: "Product engineering",
    date: "12 Mar 2026",
    readingTime: "7 min read",
    href: "https://medium.com/@Ric_Royal/building-a-composite-laminate-analysis-app-in-python-7104443e86c9",
    excerpt:
      "Engineering mechanics, numerical computing, data handling, and interface design come together in a usable analysis tool. It is a clear example of turning technical theory into an operational product.",
    relevance: "For teams that need specialist analysis packaged into software people can actually use.",
  },
];

export default function InsightsPage() {
  const [featured, ...moreInsights] = insights;

  return (
    <>
      <section className="system-grid border-b border-white/10 bg-slate-dark py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">
              Selected insights
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Read the thinking behind the systems.
            </h1>
          </div>
          <div className="flex flex-col justify-end lg:col-span-4">
            <p className="max-w-md text-base leading-relaxed text-neutral-300">
              We write to make technical choices easier to evaluate. These pieces explain what good analysis requires, where AI adds value, and why useful systems begin with sound evidence.
            </p>
            <a
              href="https://medium.com/@Ric_Royal"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-fit border-b border-signal pb-2 text-xs font-bold uppercase tracking-[0.1em] text-signal transition-colors hover:border-white hover:text-white"
            >
              View the full Medium archive <span className="ml-8" aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="paper-grid border-b border-neutral-300 bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="grid border border-slate-dark bg-white lg:grid-cols-12">
            <div className="flex min-h-[430px] flex-col justify-between bg-[#183c2e] p-7 text-white sm:p-10 lg:col-span-7">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                  Recommended first read
                </span>
                <span className="font-mono text-xs text-white/60">01 / 04</span>
              </div>
              <div className="mt-24">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                  {featured.category} / {featured.readingTime}
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                  {featured.title}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                  Why it matters
                </p>
                <p className="mt-5 text-lg leading-relaxed text-neutral-700">{featured.excerpt}</p>
                <p className="mt-8 border-l-2 border-signal pl-4 text-sm leading-relaxed text-neutral-600">
                  {featured.relevance}
                </p>
              </div>
              <div className="mt-14 flex items-end justify-between border-t border-neutral-300 pt-5">
                <span className="font-mono text-xs text-neutral-500">{featured.date}</span>
                <a
                  href={featured.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-[0.1em] text-jungle transition-colors hover:text-slate-dark"
                >
                  Read on Medium <span className="ml-5" aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-end justify-between gap-6 border-b border-neutral-300 pb-5">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                Continue reading
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">
                Three useful ways into the work.
              </h2>
            </div>
            <span className="hidden font-mono text-xs text-neutral-500 sm:block">CURATED / NOT EXHAUSTIVE</span>
          </div>

          <div className="grid border-l border-neutral-300 md:grid-cols-3">
            {moreInsights.map((insight, index) => (
              <article
                key={insight.title}
                className="flex min-h-[430px] flex-col justify-between border-b border-r border-neutral-300 bg-white p-6 transition-colors hover:bg-neutral-50 sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-jungle">
                      {insight.category}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">0{index + 2}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground">
                    {insight.title}
                  </h3>
                  <p className="mt-5 text-sm leading-relaxed text-neutral-600">{insight.excerpt}</p>
                  <p className="mt-6 border-l-2 border-signal pl-3 text-xs leading-relaxed text-neutral-500">
                    {insight.relevance}
                  </p>
                </div>
                <div className="mt-10 border-t border-neutral-300 pt-5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500">
                    <span>{insight.date}</span>
                    <span>{insight.readingTime}</span>
                  </div>
                  <a
                    href={insight.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex text-xs font-bold uppercase tracking-[0.1em] text-jungle transition-colors hover:text-slate-dark"
                  >
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
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
              Apply the thinking
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl">
              If the problem feels familiar, let&apos;s examine your system.
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-between gap-16 border border-slate-dark bg-slate-dark px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jungle"
          >
            Start a conversation <span aria-hidden>↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
