import Link from "next/link";
import { projects } from "@/data/projects";

const capabilities = [
  {
    number: "01",
    title: "Decision analytics",
    description:
      "When reporting is slow or contested, we connect the data, measures, and interfaces teams need to act with confidence.",
  },
  {
    number: "02",
    title: "Applied AI",
    description:
      "Use AI where it removes real friction. We build task-specific systems with evaluation, oversight, and a clear role in the workflow.",
  },
  {
    number: "03",
    title: "Research systems",
    description:
      "When the evidence is fragmented, we structure research around the choice leadership must make, not the document it must produce.",
  },
  {
    number: "04",
    title: "Risk infrastructure",
    description:
      "Make risk visible early with monitoring, scoring, and audit systems built for regulated environments and accountable decisions.",
  },
];

const projectPalette = [
  "bg-[#183c2e]",
  "bg-[#172d3a]",
  "bg-[#332c20]",
  "bg-[#2d2438]",
];

export default function Home() {
  const featuredProjects = projects.slice(0, 4);

  return (
    <>
      <section className="system-grid relative overflow-hidden border-b border-white/10 bg-slate-dark text-white">
        <div className="mx-auto grid min-h-[calc(100svh-65px)] max-w-[1440px] grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between border-white/10 px-5 py-16 lg:col-span-8 lg:border-r lg:px-8 lg:py-20">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">
              <span className="signal-pulse h-2 w-2 bg-signal" />
              Nairobi / East Africa / Global systems
            </div>

            <div className="my-20 max-w-5xl lg:my-24">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
                Decision intelligence, applied.
              </p>
              <h1 className="text-[clamp(3.6rem,9vw,8.5rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
                DATA.
                <br />
                DECISIONS.
                <br />
                <span className="text-signal">SYSTEMS.</span>
              </h1>
              <p className="mt-9 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">
                Most organisations do not need more data. They need a reliable way
                to decide what to do next. SDS builds the analytics, applied AI,
                research products, and digital infrastructure that make that possible.
              </p>
            </div>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link
                href="/work"
                className="inline-flex items-center justify-between gap-12 border border-signal bg-signal px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-dark transition-colors hover:bg-white"
              >
                Explore the work <span aria-hidden>↗</span>
              </Link>
              <Link
                href="/contact"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-300 underline decoration-neutral-600 underline-offset-8 transition-colors hover:text-signal"
              >
                Bring us a hard problem
              </Link>
            </div>
          </div>

          <aside className="flex flex-col justify-between px-5 py-12 lg:col-span-4 lg:px-8 lg:py-20">
            <div>
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  SDS operating model
                </span>
                <span className="font-mono text-[10px] text-signal">v1.0</span>
              </div>
              <ol className="divide-y divide-white/15">
                {[
                  ["01", "Understand", "Find the decision beneath the request."],
                  ["02", "Architect", "Design the data, logic, and interface as one system."],
                  ["03", "Deploy", "Build for the institution that must own it."],
                ].map(([step, title, text]) => (
                  <li key={step} className="grid grid-cols-[48px_1fr] gap-3 py-6">
                    <span className="font-mono text-xs text-signal">{step}</span>
                    <div>
                      <h2 className="text-base font-semibold">{title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 border border-white/20 bg-white/[0.03] p-5">
              <div className="mb-8 flex h-14 items-end gap-1" aria-hidden>
                {[36, 58, 44, 72, 55, 86, 68, 96, 76, 100].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="flex-1 bg-signal/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Signal over noise
              </p>
              <p className="mt-2 text-sm font-medium text-white">
                Build only what improves the decision.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="paper-grid border-b border-neutral-300 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="grid gap-8 border-b border-neutral-300 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                Selected systems / 2025—26
              </p>
              <h2 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                The work is the proof.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600 lg:col-span-4 lg:justify-self-end">
              Not a gallery of glossy screens. A record of the decisions, data,
              and infrastructure behind systems that have to work in the real world.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.slug}
                href={`/work#${project.slug}`}
                className={`project-visual group flex min-h-[430px] flex-col justify-between border border-slate-dark p-6 text-white transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${projectPalette[index]}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-mono text-xs text-signal">{project.code}</span>
                  <span className="border border-white/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.13em] text-neutral-300">
                    {project.status}
                  </span>
                </div>

                <div className="relative z-10 mt-24 max-w-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">
                    {project.category} / {project.sector}
                  </p>
                  <h3 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
                    {project.title}
                  </h3>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70">
                    {project.summary}
                  </p>
                  <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/20 pt-4">
                    <span className="max-w-[75%] font-mono text-xs text-white">{project.signal}</span>
                    <span className="text-xl text-signal transition-transform group-hover:translate-x-1" aria-hidden>
                      ↗
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/work"
              className="inline-flex items-center gap-10 border-b border-slate-dark pb-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors hover:border-jungle hover:text-jungle"
            >
              Open the full project index <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-neutral-50 py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
              Capabilities
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-5xl">
              From ambiguity to an operating system.
            </h2>
          </div>
          <div className="border-t border-neutral-300 lg:col-span-8">
            {capabilities.map((capability) => (
              <Link
                key={capability.number}
                href="/services"
                className="group grid gap-4 border-b border-neutral-300 py-7 transition-colors hover:bg-white sm:grid-cols-[56px_0.8fr_1.2fr_24px] sm:items-start sm:px-4"
              >
                <span className="font-mono text-xs text-jungle">{capability.number}</span>
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{capability.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{capability.description}</p>
                <span className="text-jungle transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-dark text-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
          <div className="border-white/10 px-5 py-20 lg:col-span-8 lg:border-r lg:px-8 lg:py-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
              SDS point of view
            </p>
            <blockquote className="mt-7 max-w-5xl text-4xl font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl">
              “No dashboards for dashboards’ sake. No AI theatre. No research that ends at the PDF.”
            </blockquote>
          </div>
          <div className="flex flex-col justify-between px-5 py-12 lg:col-span-4 lg:px-8 lg:py-28">
            <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
              We work where analysis must survive regulation, operational constraints,
              human behaviour, and institutional ownership.
            </p>
            <div className="mt-16 space-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Base</span><span className="text-neutral-300">Nairobi, Kenya</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Scope</span><span className="text-neutral-300">East Africa + beyond</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Domain</span><span className="text-signal">datasds.org</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-signal text-slate-dark">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-5 py-16 sm:flex-row sm:items-end lg:px-8 lg:py-20">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
              Have a consequential problem?
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              Let’s build the system behind the decision.
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
