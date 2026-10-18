import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Managed Analytics",
  description:
    "SDS provides managed reporting, data quality monitoring and decision analytics for organisations in Kenya and East Africa. Explore a fixed-scope assessment or monthly engagement.",
  alternates: { canonical: "/managed-analytics/" },
  openGraph: {
    type: "website",
    siteName: "SDS",
    title: "Managed Analytics | SDS",
    description:
      "Explore a data and reporting review from USD 350 and managed analytics from USD 1,200 per month, with final pricing scoped per engagement.",
    url: "/managed-analytics/",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "SDS — Data. Decisions. Systems." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Managed Analytics | SDS",
    description:
      "A scoped data and reporting review or an ongoing analytics service for your organisation.",
    images: ["/og.png"],
  },
};

const included = [
  {
    number: "01",
    title: "Data that reconciles",
    description:
      "We check completeness, duplicates, inconsistent definitions and unexplained changes before numbers reach management.",
  },
  {
    number: "02",
    title: "Reporting people can use",
    description:
      "A documented data model, refresh process and focused management views replace repeated manual reporting.",
  },
  {
    number: "03",
    title: "A clear decision record",
    description:
      "Each month, we record the findings, exceptions, owners and next actions. Your institution keeps the evidence.",
  },
];

const engagement = [
  {
    label: "Starting engagement",
    name: "Data & Reporting Review",
    price: "From USD 350",
    period: "fixed-scope assessment",
    description:
      "A paid first step for organisations with unreliable or labour-intensive reporting.",
    details: [
      "Discovery and access review",
      "Assessment of up to two agreed data extracts",
      "Quality and reconciliation findings",
      "Priority fixes and implementation quotation",
    ],
    note: "Delivery timeline and access needs agreed in the quote.",
  },
  {
    label: "Monthly service",
    name: "Managed Decision Analytics",
    price: "From USD 1,200",
    period: "per month, indicative",
    description:
      "An ongoing analytics function for organisations that need reliable information without adding a permanent team.",
    details: [
      "A defined set of connected sources and refresh schedules",
      "Documented KPIs and quality rules",
      "Agreed dashboards, reporting outputs and access roles",
      "Scheduled reporting and exceptions log",
      "Monthly analysis memo and two review sessions",
    ],
    note: "USD 1,200 is an entry floor for a contained workload. Source count, refresh frequency, volumes, analysis capacity, coverage hours and service levels determine the retainer. Setup, licences, hosting, taxes and new integrations are priced explicitly in the quote.",
  },
  {
    label: "Specialist engagement",
    name: "Regulatory Data & Evidence",
    price: "Quoted",
    period: "based on scope and risk",
    description:
      "For organisations that need traceability, reconciliations and reviewable evidence.",
    details: [
      "Data lineage and source-to-report checks",
      "Exception identification and remediation backlog",
      "Evidence and control documentation",
      "Technical support for internal risk and assurance teams",
    ],
    note: "Not a statutory audit, certification or legal opinion.",
  },
];

export default function ManagedAnalyticsPage() {
  return (
    <>
      <section className="system-grid border-b border-white/10 bg-slate-dark text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:py-28 lg:px-8">
          <div className="max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
              SDS / Managed services / Kenya & East Africa
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.94] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Your data should<br />work every month.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
              SDS maintains reporting systems, tests data quality and gives decision-makers
              a defensible account of what changed. For organisations with real operating data,
              recurring decisions and no appetite for another reporting backlog.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-8 border border-signal bg-signal px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-dark transition-colors hover:bg-white"
              >
                Request a scoped quote <span aria-hidden>↗</span>
              </Link>
              <a href="/samples/data-quality/report.html" className="text-sm text-neutral-300 underline underline-offset-8 hover:text-white">
                Inspect a sample assessment
              </a>
              <a href="mailto:contact@datasds.org?subject=Managed%20Analytics%20Enquiry" className="text-sm text-neutral-300 underline underline-offset-8 hover:text-white">
                contact@datasds.org
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-jungle">The operating problem</p>
              <h2 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">
                No one should have to rebuild the same report twice.
              </h2>
            </div>
            <div className="lg:col-span-8">
              {included.map((item) => (
                <div key={item.number} className="grid gap-4 border-t border-neutral-300 py-7 sm:grid-cols-[56px_1fr_1.4fr]">
                  <span className="font-mono text-sm text-jungle">{item.number}</span>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-jungle">Data access & operations</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Connect the systems you already use.</h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-neutral-600">CSV and Excel extracts can start an assessment. An ongoing service can use agreed database connections, application APIs, secure file transfers or your existing warehouse and BI environment. We choose and test the access method with your technical team.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              ["Databases & warehouses", "Read-only service accounts, replicas or approved views for SQL databases and cloud warehouses. Client-hosted pipelines or private connectivity can be scoped where data must remain in your environment."],
              ["APIs & business applications", "Scheduled extraction from authorised application APIs, with agreed fields, rate limits and refresh frequency. Bespoke connectors require discovery, implementation and acceptance testing."],
              ["Secure files & shared storage", "Scheduled SFTP or controlled object-storage deliveries for CSV, Excel and other agreed formats, with schema checks, encryption and retention rules."],
              ["A maintained analytics function", "Data models, KPI definitions, pipeline monitoring, reconciliation, failed-refresh alerts and a remediation log. The contract defines dashboard changes, analyst capacity, review sessions and incident coverage."],
            ].map(([title, description]) => <article key={title} className="border-t border-neutral-300 pt-6"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-neutral-600">{description}</p></article>)}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-neutral-500">Access, data residency and permissions are agreed before connection. The public assessment sample demonstrates file quality checks; production integrations are configured for each client. Send a brief first, then use the agreed secure access process for data and credentials.</p>
        </div>
      </section>

      <section className="bg-neutral-50 py-20 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-jungle">How we engage</p>
            <h2 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-6xl">
              Start with evidence. Continue where it pays.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-neutral-600">
              USD starting prices are indicative, not currency conversions or binding offers. SDS issues an exact quote, scope,
              delivery schedule and payment terms for approval before work starts.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {engagement.map((plan) => (
              <article key={plan.name} className="flex flex-col border border-neutral-300 bg-white p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-jungle">{plan.label}</p>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{plan.name}</h3>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{plan.price}</p>
                <p className="mt-1 text-xs text-neutral-500">{plan.period}</p>
                <p className="mt-7 min-h-20 text-sm leading-relaxed text-neutral-600">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-3 border-t border-neutral-200 pt-6">
                  {plan.details.map((detail) => (
                    <li key={detail} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
                      <span className="shrink-0 text-jungle" aria-hidden>—</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 border-t border-neutral-200 pt-4 text-xs leading-relaxed text-neutral-500">{plan.note}</p>
                <Link
                  href="/contact"
                  className="mt-7 flex items-center justify-between bg-slate-dark px-5 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-jungle"
                >
                  Discuss scope <span aria-hidden>↗</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-slate-dark py-14 text-white">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8"><div><h2 className="text-3xl font-semibold tracking-tight">Need a new institutional platform?</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-300">Multi-system implementation, indicator registries, GIS, migration, security testing and training form a separately quoted delivery programme, followed by an optional operations agreement.</p></div><Link href="/institutional-data-platforms" className="inline-block border border-signal px-6 py-4 text-sm font-semibold text-signal hover:bg-white/5">Institutional Data Platforms ↗</Link></div>
      </section>

      <section className="border-t border-neutral-300 bg-background py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-jungle">What we need from you</p>
            <h2 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">A real problem, an owner and permission to examine the data.</h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-base leading-relaxed text-neutral-600">
              Tell us which decision is delayed, which report cannot be reconciled or which
              manual workflow consumes your team&apos;s time. We define a contained first
              engagement, agree access and security requirements, and deliver reviewable output.
            </p>
            <div className="mt-9 flex flex-wrap gap-5">
              <Link href="/contact" className="bg-jungle px-7 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-jungle-dark">
                Send a project brief ↗
              </Link>
              <Link href="/work" className="border border-neutral-400 px-7 py-4 text-xs font-bold uppercase tracking-[0.1em] hover:border-jungle hover:text-jungle">
                See selected work ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
