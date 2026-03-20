import Link from "next/link";

const services = [
  {
    title: "Data Analytics & BI",
    description:
      "Structured analytics pipelines, dashboards, and business intelligence systems that turn operational data into decision-ready insight.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 5-9" />
      </svg>
    ),
  },
  {
    title: "Applied AI & NLP",
    description:
      "Machine learning models and natural language systems built for real-world deployment — from document intelligence to conversational agents.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
        <circle cx="12" cy="6" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Research & Advisory",
    description:
      "Sector research, policy analysis, and strategic advisory rooted in data. We help organisations make evidence-based decisions.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: "Risk & Compliance",
    description:
      "AML analytics, compliance monitoring, and risk management systems designed for regulated environments.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

const sectors = [
  "Financial Services & Compliance",
  "Government & Public Institutions",
  "Healthcare & Clinics",
  "Telecom & Digital Infrastructure",
  "SMEs & Operational Systems",
];

const caseStudies = [
  {
    title: "CivilBot",
    category: "Applied AI",
    summary:
      "An AI-powered legal information assistant helping citizens navigate civic processes through natural language interaction.",
  },
  {
    title: "MediMesh",
    category: "Healthcare Systems",
    summary:
      "A distributed health data system connecting clinics with shared analytics — improving care coordination and reporting.",
  },
  {
    title: "AML Risk Analytics",
    category: "Financial Compliance",
    summary:
      "Transaction monitoring and anomaly detection systems for financial institutions operating in regulated markets.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-jungle)_0%,_transparent_50%)] opacity-[0.04]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Decision Intelligence & Applied Systems
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              We build the systems{" "}
              <span className="text-jungle">that make better decisions possible.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-500">
              SDS is a decision intelligence company focused on analytics, applied AI, research, and sector-specific digital systems. We help organisations in regulated and complex environments turn data into clarity.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-jungle px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-jungle-dark"
              >
                Start a Conversation
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50"
              >
                See Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              What We Do
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Four capabilities, one focus
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              Every engagement starts with understanding the decision that needs to be made. Then we build the system that supports it.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-jungle/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-jungle/10 text-jungle">
                  {service.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="text-sm font-medium text-jungle hover:text-jungle-dark transition-colors"
            >
              Explore all services &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Sector Focus */}
      <section className="border-t border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-jungle">
                Sector Focus
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Built for complex, regulated environments
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                We work in sectors where the stakes are high and the systems must be reliable. Our depth in compliance, healthcare, telecom, and public-interest systems is what sets us apart from generic consultancies.
              </p>
              <Link
                href="/solutions"
                className="mt-8 inline-flex items-center text-sm font-medium text-jungle hover:text-jungle-dark transition-colors"
              >
                View sector solutions &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sectors.map((sector) => (
                <div
                  key={sector}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 transition-colors hover:border-jungle/30"
                >
                  <div className="h-2 w-2 rounded-full bg-jungle" />
                  <span className="text-sm font-medium text-foreground">{sector}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why SDS */}
      <section className="border-t border-neutral-100 bg-slate-dark py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle-light">
              Why SDS
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              What makes us different
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Regulated environment experience",
                text: "We understand compliance, audit trails, and institutional accountability — not just data pipelines.",
              },
              {
                title: "Research-led thinking",
                text: "Every system we build starts with rigorous analysis. We do the thinking before the building.",
              },
              {
                title: "Analysis to system design",
                text: "We don't stop at dashboards. We move from insight to working systems that organisations rely on daily.",
              },
              {
                title: "East Africa context",
                text: "We build with deep knowledge of regional markets, regulatory landscapes, and institutional realities.",
              },
              {
                title: "Practical sector depth",
                text: "Compliance, healthcare, telecom, public systems — real knowledge, not surface-level familiarity.",
              },
              {
                title: "End-to-end capability",
                text: "From data strategy to deployed system — advisory, engineering, and ongoing support under one roof.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="border-t border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-jungle">
                Featured Work
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Proof of what we build
              </h2>
            </div>
            <Link
              href="/work"
              className="hidden text-sm font-medium text-jungle hover:text-jungle-dark transition-colors sm:block"
            >
              View all projects &rarr;
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {caseStudies.map((study) => (
              <Link
                key={study.title}
                href="/work"
                className="group rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-jungle/30 hover:shadow-sm"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-jungle">
                  {study.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-jungle transition-colors">
                  {study.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {study.summary}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-jungle">
                  Read more &rarr;
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/work"
              className="text-sm font-medium text-jungle hover:text-jungle-dark transition-colors"
            >
              View all projects &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Ready to build something that works?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500">
            Whether you need a data strategy, an analytics system, or a full-stack digital solution — let&apos;s start with a conversation.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-jungle px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-jungle-dark"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
