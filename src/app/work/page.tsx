import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies and project snapshots from SDS — real problems, practical solutions, measurable outcomes.",
};

const projects = [
  {
    title: "CivilBot",
    category: "Applied AI",
    sector: "Legal / Public Interest",
    status: "In development",
    problem:
      "Citizens struggle to understand civic and legal processes. Legal information is scattered across government sites, written in complex language, and hard to navigate without professional help.",
    approach:
      "We're building a conversational AI assistant that helps citizens navigate civic processes through natural language interaction. CivilBot uses NLP to interpret questions, retrieves relevant legal information, and presents answers in plain language.",
    architecture: [
      "Large language model with retrieval-augmented generation (RAG)",
      "Curated legal knowledge base",
      "Conversational interface with context management",
      "Feedback loop for continuous improvement",
    ],
    value:
      "Making legal information accessible to citizens who can't afford legal counsel — reducing information asymmetry in civic engagement.",
  },
  {
    title: "MediMesh",
    category: "Healthcare Systems",
    sector: "Healthcare",
    status: "In development",
    problem:
      "Clinics in distributed health systems operate in silos. Patient data stays locked in facility-level systems, making care coordination, referral tracking, and system-wide reporting nearly impossible.",
    approach:
      "MediMesh is a distributed health data platform that connects clinics with shared analytics. It enables interoperability between facilities while respecting data governance and patient privacy requirements.",
    architecture: [
      "Distributed data architecture with facility-level nodes",
      "Standardised health data models (HL7 FHIR aligned)",
      "Shared analytics layer for cross-facility insights",
      "Role-based access control and audit logging",
    ],
    value:
      "Improved care coordination across facilities, better health outcome tracking, and system-level decision support for health administrators.",
  },
  {
    title: "AML Risk Analytics Platform",
    category: "Financial Compliance",
    sector: "Financial Services",
    status: "Delivered",
    problem:
      "A financial institution needed to detect suspicious transactions and meet regulatory reporting obligations. Existing processes relied on manual review and basic rule-based alerts, missing complex patterns.",
    approach:
      "We designed and built an AML analytics system with anomaly detection models, risk scoring algorithms, and automated alert workflows. The system integrates with existing transaction databases and generates regulatory reports.",
    architecture: [
      "Transaction data pipeline with real-time ingestion",
      "Statistical anomaly detection models",
      "Risk scoring engine with configurable thresholds",
      "Compliance dashboard with audit trail",
    ],
    value:
      "Reduced false positive alerts by 40%. Automated regulatory reporting that previously required days of manual work. Full audit trail for examiner review.",
  },
  {
    title: "Telecom Churn Analytics",
    category: "Data Analytics",
    sector: "Telecommunications",
    status: "Delivered",
    problem:
      "A telecom operator was losing subscribers but couldn't identify the drivers of churn or predict which customers were at risk. Marketing spend was untargeted and retention efforts were reactive.",
    approach:
      "We built a churn prediction system using historical subscriber data, usage patterns, and network quality metrics. The system identifies at-risk customers and provides actionable retention insights.",
    architecture: [
      "Data warehouse integration with CDR and CRM systems",
      "Machine learning models for churn prediction",
      "Customer segmentation analysis",
      "Retention campaign recommendation engine",
    ],
    value:
      "Identified key churn drivers, enabling targeted retention campaigns. Improved prediction accuracy allowed proactive intervention before customer departure.",
  },
  {
    title: "Sector Research Products",
    category: "Research & Advisory",
    sector: "Cross-sector",
    status: "Ongoing",
    problem:
      "Decision-makers in East African markets lack reliable, data-driven sector intelligence. Available reports are often outdated, too generic, or produced without local context.",
    approach:
      "We produce research products that combine primary data collection, secondary analysis, and local market expertise. Reports are structured around decisions — not just data — giving readers frameworks for action.",
    architecture: [
      "Primary and secondary research methodology",
      "Quantitative analysis with local datasets",
      "Expert interviews and qualitative validation",
      "Decision-oriented report frameworks",
    ],
    value:
      "Research products used by investors, NGOs, and government agencies to inform market entry, programme design, and policy decisions.",
  },
];

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Our Work
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Real problems. Practical solutions.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              We believe in showing the work. These case studies and project
              snapshots show how SDS approaches problems — from understanding the
              challenge to designing and delivering the system.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects.map((project, idx) => (
        <section
          key={project.title}
          className={`border-t border-neutral-100 py-24 ${
            idx % 2 === 0 ? "bg-neutral-50" : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-jungle/10 px-3 py-1 text-xs font-medium text-jungle">
                    {project.category}
                  </span>
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
                    {project.sector}
                  </span>
                  <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500">
                    {project.status}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {project.title}
                </h2>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    The Problem
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    {project.problem}
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    Our Approach
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-neutral-600">
                    {project.approach}
                  </p>
                </div>
              </div>

              <div>
                <div className="rounded-xl border border-neutral-200 bg-white p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    Architecture & Method
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {project.architecture.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jungle" />
                        <span className="text-sm leading-relaxed text-neutral-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 rounded-xl border border-jungle/20 bg-jungle/5 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-jungle-dark">
                    Value Delivered
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-jungle-dark">
                    {project.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-slate-dark py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Have a project in mind?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
            We&apos;re always interested in meaningful problems. Tell us about
            yours and we&apos;ll explore whether SDS is the right fit.
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
