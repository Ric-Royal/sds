import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Data analytics, applied AI, research and advisory, and risk and compliance systems built for complex environments.",
};

const services = [
  {
    id: "analytics",
    title: "Data Analytics & BI",
    problem:
      "Most organisations sit on operational data they never fully use. Spreadsheets, siloed databases, and ad-hoc reports create blind spots instead of insight.",
    what: "We design and build structured analytics systems, from data pipelines and warehouses to interactive dashboards and automated reporting. Every system is tailored to the decisions your organisation needs to make.",
    deliverables: [
      "Data pipeline architecture and implementation",
      "Business intelligence dashboards",
      "Automated reporting systems",
      "Data quality assessment and governance frameworks",
      "KPI definition and measurement systems",
    ],
    who: "Operations leaders, CFOs, programme managers, and M&E teams who need reliable, repeatable insight from their data.",
  },
  {
    id: "ai",
    title: "Applied AI & Natural Language Processing",
    problem:
      "AI is everywhere in marketing but scarce where it matters most. Most organisations do not need a generic chatbot. They need intelligent document processing, classification, or decision support that improves a real workflow.",
    what: "We build AI and NLP systems designed for deployment, from document intelligence and information extraction to conversational agents and recommendation engines. Every model is tested, validated, and integrated into the client's workflow.",
    deliverables: [
      "NLP models for document classification and extraction",
      "Conversational AI agents (task-specific, not generic)",
      "Predictive analytics models",
      "AI integration into existing workflows",
      "Model monitoring and retraining pipelines",
    ],
    who: "Product teams, compliance officers, legal departments, and service organisations that process high volumes of unstructured information.",
  },
  {
    id: "research",
    title: "Research & Advisory",
    problem:
      "Strategic decisions in complex markets require more than internal data. They require sector analysis, regulatory understanding, and evidence-based frameworks that most organisations lack the capacity to build in-house.",
    what: "We conduct primary and secondary research, policy analysis, and strategic advisory engagements grounded in data. Our research products help organisations understand markets, assess risk, and make decisions with confidence.",
    deliverables: [
      "Sector research and market intelligence reports",
      "Policy analysis and regulatory landscape reviews",
      "Data-driven strategy frameworks",
      "Feasibility studies and due diligence reports",
      "Custom research products for ongoing decision support",
    ],
    who: "Executives, board members, investors, and public-sector leaders who need evidence before action.",
  },
  {
    id: "risk",
    title: "Risk & Compliance Support",
    problem:
      "Financial institutions and regulated organisations face growing compliance burdens. AML requirements, transaction monitoring, and audit obligations evolve faster than many internal systems.",
    what: "We design and build compliance analytics systems for AML monitoring, risk scoring, anomaly detection, and audit reporting. Our systems are built for regulatory environments, not adapted from generic templates.",
    deliverables: [
      "AML transaction monitoring systems",
      "Risk scoring and anomaly detection models",
      "Compliance dashboard and reporting tools",
      "Regulatory data architecture",
      "Audit-ready documentation and data lineage",
    ],
    who: "Compliance officers, risk managers, internal audit teams, and fintech companies navigating regulatory requirements.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Services
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Four capabilities. One principle: build what works.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              Every service we offer starts with the same question: what decision
              does this system need to support? From there, we design, build, and
              deliver.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      {services.map((service, idx) => (
        <section
          key={service.id}
          id={service.id}
          className={`border-t border-neutral-100 py-24 ${
            idx % 2 === 0 ? "bg-neutral-50" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {service.title}
                </h2>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    The Problem
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    {service.problem}
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    What SDS Does
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    {service.what}
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    Who It&apos;s For
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    {service.who}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    Typical Deliverables
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jungle" />
                        <span className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-jungle px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-jungle-dark"
                >
                  Discuss This Service
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-slate-dark py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Not sure which service fits?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
            Most engagements combine more than one capability. Start with a
            conversation and we&apos;ll scope the right approach together.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-jungle px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-jungle-dark"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}
