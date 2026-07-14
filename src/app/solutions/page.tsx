import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Sector-focused solutions for financial services, government, healthcare, telecom, and SMEs.",
};

const sectors = [
  {
    title: "Financial Services & Compliance",
    description:
      "Banks, fintechs, and financial institutions face growing regulatory pressure. SDS builds the analytics and compliance systems that help them meet obligations without drowning in manual processes.",
    capabilities: [
      "AML and transaction monitoring",
      "Risk scoring and anomaly detection",
      "Regulatory reporting dashboards",
      "Customer due diligence automation",
      "Compliance data architecture",
    ],
    context:
      "We understand KYC/AML requirements, central bank reporting frameworks, and the operational realities of financial institutions in emerging markets.",
  },
  {
    title: "Government & Public Institutions",
    description:
      "Public-sector organisations need systems that support evidence-based policy, programme monitoring, and citizen services. They also face constraints that commercial vendors rarely understand.",
    capabilities: [
      "Monitoring and evaluation data systems",
      "Policy analysis and research platforms",
      "Citizen service digital tools",
      "Public data infrastructure",
      "Institutional knowledge management",
    ],
    context:
      "We design systems that work within procurement constraints, multi-stakeholder environments, and the need for transparency and auditability.",
  },
  {
    title: "Healthcare & Clinics",
    description:
      "Health systems generate enormous amounts of data from patient records, lab results, and supply chains. Most lack the infrastructure to use it for decision-making at the facility or system level.",
    capabilities: [
      "Health data integration and interoperability",
      "Clinical analytics dashboards",
      "Patient flow and resource optimisation",
      "Supply chain analytics",
      "Health research data platforms",
    ],
    context:
      "We work at the intersection of clinical operations and data systems, building tools that clinicians and administrators can actually use.",
  },
  {
    title: "Telecom & Digital Infrastructure",
    description:
      "Telecom operators and digital infrastructure providers sit on massive CDR, usage, and network datasets. Used well, that evidence can drive revenue, reduce churn, and improve service quality.",
    capabilities: [
      "Churn analytics and prediction",
      "Customer segmentation and value analysis",
      "Network performance analytics",
      "Revenue assurance systems",
      "Usage pattern analysis",
    ],
    context:
      "We bring experience in telecom data architectures, regulatory compliance, and the commercial dynamics of connectivity markets.",
  },
  {
    title: "SMEs & Operational Systems",
    description:
      "Small and medium enterprises need operational systems that work without enterprise budgets. SDS builds lean, practical digital systems that help SMEs track, measure, and grow.",
    capabilities: [
      "Operational dashboards and KPI tracking",
      "Workflow automation",
      "Customer analytics",
      "Inventory and supply chain visibility",
      "Custom digital tools",
    ],
    context:
      "We build systems that respect the constraints of smaller organisations, including limited budgets, small teams, and the need for immediate, practical value.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Solutions by Sector
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Context matters. We build systems that fit yours.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              Generic tools rarely survive contact with real organisations. We
              design systems with deep knowledge of the sector, its regulations,
              workflows, and institutional realities.
            </p>
          </div>
        </div>
      </section>

      {/* Sectors */}
      {sectors.map((sector, idx) => (
        <section
          key={sector.title}
          className={`border-t border-neutral-100 py-24 ${
            idx % 2 === 0 ? "bg-neutral-50" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {sector.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-neutral-600">
                  {sector.description}
                </p>
                <div className="mt-6 rounded-lg border border-jungle/20 bg-jungle/5 p-4">
                  <p className="text-sm leading-relaxed text-jungle-dark">
                    <span className="font-semibold">Our context:</span>{" "}
                    {sector.context}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center text-sm font-medium text-jungle hover:text-jungle-dark transition-colors"
                >
                  Discuss your needs &rarr;
                </Link>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Key Capabilities
                </h3>
                <ul className="mt-4 space-y-3">
                  {sector.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jungle" />
                      <span className="text-sm leading-relaxed text-neutral-600">
                        {cap}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-slate-dark py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Working in a sector we haven&apos;t listed?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
            Our approach applies to any environment where data-driven decisions
            matter. Let&apos;s explore how SDS can help.
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
