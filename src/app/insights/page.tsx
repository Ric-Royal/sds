import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Articles, research notes, and analysis from SDS on analytics, AI, compliance, and decision systems.",
};

const insights = [
  {
    title: "Why Most BI Dashboards Fail — And What to Build Instead",
    category: "Analytics",
    type: "Article",
    date: "March 2026",
    excerpt:
      "The problem isn't the dashboards. It's that most dashboards are built to display data, not to support decisions. We explore what decision-oriented BI actually looks like.",
  },
  {
    title: "AML Compliance in East Africa: Where the Gaps Are",
    category: "Compliance",
    type: "Research Note",
    date: "February 2026",
    excerpt:
      "An analysis of common compliance gaps in East African financial institutions, with practical recommendations for improving AML systems and processes.",
  },
  {
    title: "Applied AI vs. AI Theatre: A Framework for What Actually Works",
    category: "AI",
    type: "Article",
    date: "January 2026",
    excerpt:
      "Most AI projects fail because they solve the wrong problem. We propose a simple framework for identifying where applied AI creates real value — and where it doesn't.",
  },
  {
    title: "Health Data Interoperability: Practical Steps for Distributed Clinics",
    category: "Healthcare",
    type: "Policy Brief",
    date: "December 2025",
    excerpt:
      "How distributed health systems can achieve meaningful data interoperability without enterprise-grade infrastructure — lessons from real implementations.",
  },
  {
    title: "Churn Analytics Beyond Prediction: Using Retention Data to Redesign Service",
    category: "Telecom",
    type: "Article",
    date: "November 2025",
    excerpt:
      "Predicting churn is only half the problem. The real value is in understanding why customers leave — and using that insight to change the product, not just the marketing.",
  },
  {
    title: "Building Research Products for Decision-Makers",
    category: "Research",
    type: "Commentary",
    date: "October 2025",
    excerpt:
      "Most research reports collect dust. We explore how to structure research as a product — designed around the decisions the reader needs to make, not the data the researcher collected.",
  },
];

export default function InsightsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Insights
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Clear thinking on hard problems.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              Articles, research notes, policy briefs, and analysis from SDS. We
              write about the problems we work on — analytics, AI, compliance,
              healthcare systems, and decision intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Insights Grid */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <article
                key={insight.title}
                className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:border-jungle/30 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-jungle/10 px-3 py-1 text-xs font-medium text-jungle">
                    {insight.category}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {insight.type}
                  </span>
                </div>
                <h2 className="mt-4 text-base font-semibold leading-snug text-foreground group-hover:text-jungle transition-colors">
                  {insight.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
                  {insight.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    {insight.date}
                  </span>
                  <span className="text-sm font-medium text-jungle">
                    Read &rarr;
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Want to discuss an idea?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500">
            We&apos;re always interested in conversations about analytics, AI,
            and decision systems. Reach out if something here resonated.
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
