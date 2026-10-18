import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Institutional Data Platforms",
  description: "Scoped delivery of data platforms, system integrations, indicator registries, GIS, governance, migration and ongoing operations for institutions and development programmes.",
  alternates: { canonical: "/institutional-data-platforms/" },
  openGraph: {
    title: "Institutional Data Platforms | SDS", type: "website", siteName: "SDS",
    description: "From fragmented systems to an institution-owned platform. Discovery, implementation, handover and ongoing operations, quoted to your scope.",
    url: "/institutional-data-platforms/",
    images: [{ url: "/og.png", width: 1730, height: 909, alt: "SDS — Data. Decisions. Systems." }],
  },
};

const workstreams = [
  ["01", "Architecture & governance", "Map existing systems, users, indicators and access rules. Agree the architecture, data ownership, metadata, lineage and acceptance criteria before implementation."],
  ["02", "Integration & data infrastructure", "Connect agreed databases, APIs, business applications and file feeds. Build warehouse or lakehouse models, validation, reconciliation, synchronization and monitored data pipelines."],
  ["03", "Applications & decision tools", "Develop indicator registries and calculation rules, reporting workflows, dashboards, GIS and geospatial views. Scope country or programme access, multilingual interfaces and external exchanges."],
  ["04", "Migration, security & acceptance", "Plan and rehearse migration. Implement agreed identity, permissions, audit logs, encryption, backup and recovery controls. Test performance and accessibility, resolve defects and support client UAT."],
  ["05", "Training & institutional ownership", "Deliver source code, deployment instructions, data dictionaries, runbooks and administrator training. Agree licensing, ownership and a multi-year operating cost and sustainability plan."],
  ["06", "Platform operations", "After the implementation and warranty period, contract separately for pipeline monitoring, incident response, patching, backup recovery exercises and a defined improvement backlog."],
];
const phases = [
  ["Discover & specify", "System inventory, requirements, data access, delivery team and costed implementation plan."],
  ["Build & integrate", "Versioned releases, tested pipelines, working applications and demonstrations against agreed acceptance criteria."],
  ["Validate & transfer", "Reconciled migration, security findings, client acceptance, training and a documented handover."],
  ["Operate & improve", "A separate service agreement defining coverage hours, response targets, monitoring and change capacity."],
];

export default function InstitutionalDataPlatformsPage() {
  return <>
    <section className="system-grid border-b border-white/10 bg-slate-dark text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:py-28 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">SDS / Institutional Data Platforms</p>
        <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl lg:text-8xl">Build the system your institution can own.</h1>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-neutral-300">A scoped delivery programme for organisations connecting multiple systems, countries or programmes. SDS develops the data infrastructure, applications and operating processes that turn fragmented information into a shared institutional resource.</p>
        <div className="mt-10 flex flex-wrap gap-6">
          <Link href="/contact" className="bg-signal px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-dark hover:bg-white">Request a project quotation ↗</Link>
          <a href="mailto:contact@datasds.org?subject=Institutional%20Data%20Platform%20Brief" className="py-4 text-sm underline underline-offset-8">Discuss your terms of reference</a>
        </div>
      </div>
    </section>
    <section className="border-b border-neutral-300 bg-background py-20">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4"><p className="font-mono text-xs uppercase tracking-wider text-jungle">Built around the mandate</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">One delivery programme. Defined workstreams.</h2></div>
        <div className="lg:col-span-8">{workstreams.map(([number, title, detail]) => <article key={number} className="grid gap-4 border-t border-neutral-300 py-7 sm:grid-cols-[40px_1fr]"><span className="font-mono text-sm text-jungle">{number}</span><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-neutral-600">{detail}</p></div></article>)}</div>
      </div>
    </section>
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-wider text-jungle">Delivery & acceptance</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Pay for a defined scope, with evidence at each milestone.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{phases.map(([title, detail]) => <article key={title} className="border border-neutral-300 bg-white p-6"><h3 className="text-lg font-semibold">{title}</h3><p className="mt-4 text-sm leading-relaxed text-neutral-600">{detail}</p></article>)}</div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-neutral-600">Each contract sets the deliverables, acceptance owner, review periods and payment schedule. Tender requirements govern procurement engagements. Hosting location, security testing, service levels and support hours are agreed for the specific environment.</p>
      </div>
    </section>
    <section className="border-y border-neutral-300 bg-background py-20">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <div><p className="font-mono text-xs uppercase tracking-wider text-jungle">Commercial structure</p><h2 className="mt-4 text-4xl font-semibold tracking-tight">A project quote matched to the work.</h2><p className="mt-6 text-base leading-relaxed text-neutral-600">Institutional platforms receive a separate implementation quotation. The price reflects specialist staffing, duration, integrations, data volumes, migration, languages, travel, security requirements and acceptance obligations.</p><p className="mt-5 text-sm leading-relaxed text-neutral-600">The quotation separates professional services, infrastructure and licences, third-party testing, applicable taxes and ongoing operations. A change process covers additional requirements. Managed analytics starting prices describe a smaller recurring service and do not price a full platform programme.</p></div>
        <div className="border border-neutral-300 bg-white p-7"><h3 className="text-2xl font-semibold tracking-tight">A team proposed for your assignment</h3><p className="mt-5 text-sm leading-relaxed text-neutral-600">SDS scopes engineering, analytics and delivery roles with named specialists and delivery partners where needed. Assignments requiring advanced qualifications, sector experience, GIS, independent security testing or field delivery receive a project-specific staffing plan and verified credentials before commitment.</p><p className="mt-5 text-sm leading-relaxed text-neutral-600">Share the terms of reference, existing systems, implementation period, procurement rules and budget range if available. We will identify assumptions, dependencies and qualification requirements in the response.</p><p className="mt-5 text-xs text-neutral-500">Send a brief or a public tender link first. Credentials and sensitive datasets belong in an agreed secure access process.</p><Link href="/contact" className="mt-7 inline-block bg-jungle px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-jungle-dark">Scope an institutional platform ↗</Link></div>
      </div>
    </section>
    <section className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-6 px-5 py-12 lg:px-8"><p className="max-w-xl text-lg">Already have a platform and need reliable reporting, data quality and analysis each month?</p><Link href="/managed-analytics" className="text-sm font-semibold text-jungle underline underline-offset-8">Explore managed analytics ↗</Link></section>
  </>;
}
