import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "SDS is a decision intelligence company built to help organisations in complex, regulated environments turn data into clarity and action.",
};

const values = [
  {
    title: "Rigour over speed",
    description:
      "We take the time to understand the problem fully before designing the solution. Rushing to build is how bad systems get made.",
  },
  {
    title: "Systems thinking",
    description:
      "We don't build isolated dashboards or one-off models. We design connected systems that serve the organisation end to end.",
  },
  {
    title: "Transparency",
    description:
      "Clear deliverables, honest timelines, and no black-box methodology. Clients understand what we build and why.",
  },
  {
    title: "Sector knowledge",
    description:
      "We invest in understanding the regulatory, institutional, and operational context of every sector we serve.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              About SDS
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Built to make decision systems work in the real world.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              SDS exists because too many organisations have data but lack the
              systems to use it. We close that gap — with analytics, applied AI,
              research, and digital systems designed for environments where
              getting it right matters.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Our Mission
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                To help organisations in complex, regulated, and emerging-market
                environments make better decisions — by building the data systems,
                analytics tools, and AI applications they need to operate with
                clarity and confidence.
              </p>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                We don&apos;t believe in technology for its own sake. Every system
                we build is designed to solve a specific problem, for a specific
                context, with measurable impact.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                The Problem We Solve
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                Organisations collect more data than ever, but most lack the
                infrastructure and expertise to turn that data into reliable
                decision-making systems. Off-the-shelf tools don&apos;t account
                for regulatory constraints, institutional realities, or
                sector-specific workflows.
              </p>
              <p className="mt-4 text-base leading-relaxed text-neutral-500">
                SDS bridges the gap between raw data and operational intelligence
                — building systems that fit the organisation, not the other way
                around.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="border-t border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              How We Work With Clients
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-500">
              Every engagement follows the same principle: understand the decision
              first, then build the system.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Discovery",
                text: "We learn your organisation, your data landscape, and the decisions you need to make better.",
              },
              {
                step: "02",
                title: "Architecture",
                text: "We design the system — data pipelines, models, interfaces, and integrations — before writing code.",
              },
              {
                step: "03",
                title: "Build",
                text: "We develop iteratively, sharing progress and incorporating feedback at every stage.",
              },
              {
                step: "04",
                title: "Deliver & Support",
                text: "We hand over working systems with documentation, training, and ongoing support as needed.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white p-8">
                <span className="text-sm font-mono font-semibold text-jungle">
                  {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What We Value
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title}>
                <h3 className="text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="border-t border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Leadership
            </h2>
            <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jungle/10 text-2xl font-bold text-jungle">
                F
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Founder & Principal
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                With experience spanning data analytics, applied AI, compliance
                systems, and sector research across East Africa, the founder
                brings a rare combination of technical depth and contextual
                understanding. SDS was built on the belief that the best
                technology serves the institution — not the other way around.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Background includes work in financial services analytics, public
                sector research, healthcare data systems, and AI product
                development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Let&apos;s work together.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500">
            If your organisation needs better systems for decision-making, we
            should talk.
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
