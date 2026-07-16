"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min((window.scrollY / scrollable) * 100, 100) : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden>
      <div
        className="h-full bg-signal transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

const controlGroups = [
  {
    id: "financial-institutions",
    label: "Financial institutions + PSPs",
    title: "Build an indirect exposure view",
    context:
      "Virtual-asset and sanctions risk should be visible through linked customers, counterparties, channels, and transaction behaviour.",
    actions: [
      "Validate sanctions-list ingestion and field mapping.",
      "Identify known exchanges, traders, and processors.",
      "Detect rapid collection, consolidation, and pass-through.",
      "Link customers across devices, accounts, and beneficiaries.",
    ],
  },
  {
    id: "dnfbps",
    label: "DNFBPs",
    title: "Improve ownership and funds evidence",
    context:
      "Professional intermediaries often hold information that cannot be inferred from a payment record.",
    actions: [
      "Identify the natural person who owns or controls the client.",
      "Record the source of authority and source of funds.",
      "Explain third-party payments and unusual urgency.",
      "Retain documents that support the stated commercial purpose.",
    ],
  },
  {
    id: "reporting-institutions",
    label: "All reporting institutions",
    title: "Raise the analytical standard of STRs",
    context:
      "The report should make the suspicion clear without requiring the FIU to recreate the institution's internal review.",
    actions: [
      "State the expected activity and the material deviation.",
      "Identify counterparties, controllers, and beneficiaries.",
      "Describe the movement of value across the full period.",
      "Distinguish transactional suspicion from general risk.",
    ],
  },
  {
    id: "fius-supervisors",
    label: "FIUs + supervisors",
    title: "Measure conversion, not submission alone",
    context:
      "Sector feedback should show which reporting practices produce usable intelligence and which create volume without value.",
    actions: [
      "Track identifiers, ownership links, and narrative quality.",
      "Measure linkage, dissemination, and investigative uptake.",
      "Compare conversion rates across sectors and institutions.",
      "Target supervisory action at recurring data weaknesses.",
    ],
  },
];

export function ControlAgenda() {
  const [activeId, setActiveId] = useState(controlGroups[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const active = controlGroups.find((group) => group.id === activeId) ?? controlGroups[0];
  const completedForActive = active.actions.filter((_, index) =>
    completed.includes(`${active.id}-${index}`),
  ).length;

  function toggleAction(index: number) {
    const key = `${active.id}-${index}`;
    setCompleted((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  }

  return (
    <div className="border border-neutral-300 bg-white">
      <div className="grid border-b border-neutral-300 sm:grid-cols-2 lg:grid-cols-4">
        {controlGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActiveId(group.id)}
            aria-pressed={activeId === group.id}
            className={`min-h-16 border-b border-neutral-300 px-4 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:border-r lg:border-b-0 ${
              activeId === group.id
                ? "bg-slate-dark text-signal"
                : "bg-white text-neutral-600 hover:bg-neutral-50 hover:text-jungle"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-12 lg:p-10">
        <div className="lg:col-span-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">
            Selected control agenda
          </p>
          <h3 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
            {active.title}
          </h3>
          <p className="mt-5 text-base leading-relaxed text-neutral-600">{active.context}</p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-1.5 flex-1 bg-neutral-200">
              <div
                className="h-full bg-jungle transition-[width]"
                style={{ width: `${(completedForActive / active.actions.length) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-neutral-500">
              {completedForActive}/{active.actions.length}
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            Use the checklist as a quick self-assessment. Your selections stay on this page only.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="border-t border-neutral-300">
            {active.actions.map((action, index) => {
              const key = `${active.id}-${index}`;
              const isComplete = completed.includes(key);

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => toggleAction(index)}
                  aria-pressed={isComplete}
                  className="group flex w-full items-start gap-4 border-b border-neutral-300 py-5 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] transition-colors ${
                      isComplete
                        ? "border-jungle bg-jungle text-white"
                        : "border-neutral-400 bg-white text-transparent group-hover:border-jungle"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span
                    className={`text-sm leading-relaxed transition-colors ${
                      isComplete ? "text-neutral-400 line-through" : "text-neutral-700"
                    }`}
                  >
                    {action}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
