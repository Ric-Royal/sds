import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "The SDS project index: applied AI, analytics, healthcare infrastructure, compliance systems, and decision-oriented research.",
  alternates: {
    canonical: "/work",
  },
};

const statusStyle = {
  Delivered: "bg-signal text-slate-dark",
  "In development": "border border-signal/50 text-signal",
  Ongoing: "border border-white/30 text-white",
};

export default function WorkPage() {
  return (
    <>
      <section id="top" className="paper-grid scroll-mt-20 border-b border-neutral-300 bg-background">
        <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                SDS project archive / 2025—26
              </p>
              <h1 className="mt-5 text-[clamp(4.5rem,13vw,12rem)] font-semibold leading-[0.76] tracking-[-0.085em]">
                WORK<span className="text-jungle">/</span>
              </h1>
            </div>
            <div className="border-l border-neutral-300 pl-5 lg:col-span-3">
              <p className="text-sm leading-relaxed text-neutral-600">
                A working index of systems, prototypes, and research products.
                Each entry begins with the problem—not the technology.
              </p>
              <div className="mt-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                <span className="h-2 w-2 bg-jungle" />
                {projects.length} active records
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-300 bg-neutral-50 py-16">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="mb-4 hidden grid-cols-[84px_1.1fr_0.8fr_0.8fr_28px] gap-4 border-b border-neutral-300 pb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500 md:grid">
            <span>Record</span>
            <span>Project</span>
            <span>Domain</span>
            <span>Status / signal</span>
            <span />
          </div>
          <ol className="border-t border-neutral-300 md:border-t-0">
            {projects.map((project) => (
              <li key={project.slug}>
                <a
                  href={`#${project.slug}`}
                  className="group grid gap-3 border-b border-neutral-300 py-6 transition-colors hover:bg-white md:grid-cols-[84px_1.1fr_0.8fr_0.8fr_28px] md:items-center md:gap-4 md:px-3"
                >
                  <span className="font-mono text-xs text-jungle">{project.code}</span>
                  <span className="text-xl font-semibold tracking-[-0.03em]">{project.title}</span>
                  <span className="text-sm text-neutral-600">{project.category}</span>
                  <span className="text-sm text-neutral-600">
                    {project.status} · {project.signal}
                  </span>
                  <span className="text-jungle transition-transform group-hover:translate-y-1" aria-hidden>↓</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="bg-slate-dark">
        {projects.map((project, index) => (
          <article
            key={project.slug}
            id={project.slug}
            className="scroll-mt-20 border-b border-white/15 text-white"
          >
            <div className="mx-auto grid max-w-[1440px] lg:grid-cols-12">
              <header className="project-visual min-h-[420px] border-white/15 bg-white/[0.025] px-5 py-12 lg:col-span-5 lg:border-r lg:px-8 lg:py-20">
                <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-mono text-xs text-signal">{project.code}</span>
                    <span className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[0.13em] ${statusStyle[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                      {project.category} / {project.sector}
                    </p>
                    <h2 className="mt-4 text-5xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-6xl">
                      {project.title}
                    </h2>
                    <div className="mt-8 h-px signal-rule" />
                    <p className="mt-4 font-mono text-xs text-signal">{project.signal}</p>
                  </div>
                </div>
              </header>

              <div className="px-5 py-12 lg:col-span-7 lg:px-10 lg:py-20">
                <p className="max-w-3xl text-xl leading-relaxed tracking-[-0.02em] text-neutral-200 sm:text-2xl">
                  {project.summary}
                </p>

                <div className="mt-14 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-2">
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                      01 / Problem
                    </p>
                    <p className="mt-4 text-sm leading-7 text-neutral-400">{project.problem}</p>
                  </section>
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                      02 / System response
                    </p>
                    <p className="mt-4 text-sm leading-7 text-neutral-400">{project.approach}</p>
                  </section>
                </div>

                <div className="mt-12 grid gap-8 border-t border-white/15 pt-10 md:grid-cols-2">
                  <section>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                      Architecture / method
                    </p>
                    <ul className="mt-4 space-y-0 border-t border-white/10">
                      {project.architecture.map((item, itemIndex) => (
                        <li key={item} className="grid grid-cols-[28px_1fr] gap-3 border-b border-white/10 py-3">
                          <span className="font-mono text-[10px] text-neutral-600">
                            {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm text-neutral-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="border-l-2 border-signal pl-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                      Value / direction
                    </p>
                    <p className="mt-4 text-sm leading-7 text-neutral-300">{project.value}</p>
                  </section>
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                  <span>Record {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  <a href="#top" className="transition-colors hover:text-signal">Back to index ↑</a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="bg-signal text-slate-dark">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 px-5 py-16 sm:flex-row sm:items-end lg:px-8 lg:py-20">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
              Your problem could be record {String(projects.length + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              Give us the difficult version.
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
