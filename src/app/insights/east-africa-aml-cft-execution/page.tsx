import type { Metadata } from "next";
import Link from "next/link";
import { ControlAgenda, ReadingProgress } from "./BriefInteractions";

const pdfHref = "/research/east-africa-aml-cft-execution-13-july-2026.pdf";

export const metadata: Metadata = {
  title: "East Africa's AML/CFT Test Is Now Execution",
  description:
    "An interactive SDS brief on grey-list remediation, virtual-asset exposure, STR quality, and the intelligence value of reporting in East Africa.",
  alternates: {
    canonical: "/insights/east-africa-aml-cft-execution/",
  },
  openGraph: {
    title: "East Africa's AML/CFT Test Is Now Execution",
    description:
      "Grey-list remediation, virtual-asset exposure, and the intelligence value of reporting. An SDS East Africa AML/CFT brief.",
    url: "/insights/east-africa-aml-cft-execution/",
  },
};

const chapterLinks = [
  ["00", "Executive perspective", "#executive"],
  ["01", "Increased monitoring", "#increased-monitoring"],
  ["02", "Virtual assets", "#virtual-assets"],
  ["03", "Intelligence yield", "#intelligence-yield"],
  ["04", "Network analysis", "#network-analysis"],
  ["05", "Control agenda", "#control-agenda"],
];

const findings = [
  {
    number: "01",
    title: "Implementation is now the test",
    text: "Kenya's reform agenda links supervision, reporting, ownership data, financial intelligence, and enforcement. Weak performance at one stage reduces the value of progress elsewhere.",
  },
  {
    number: "02",
    title: "Virtual-asset exposure is indirect",
    text: "Most institutions will encounter the risk through ordinary payment rails and customer relationships, not through transactions labelled as virtual assets.",
  },
  {
    number: "03",
    title: "Reporting volume is a weak proxy",
    text: "An increase in STRs may reflect supervisory pressure. It does not show that reports can be linked, disseminated, or used in an investigation.",
  },
];

const managementQuestions = [
  ["Q1", "Can we evidence the latest sanctions update?", "Record the source file, ingestion time, field mapping, screening run, and any required rescreening."],
  ["Q2", "Can we identify indirect VASP exposure?", "Test counterparties, devices, transaction velocity, common beneficiaries, and links to known providers."],
  ["Q3", "Can an external analyst follow the suspicion?", "Explain the expected activity, the observed deviation, the parties involved, and the movement of value."],
  ["Q4", "Are we measuring activity or effect?", "Submission counts show work completed. Linkage, investigation, and intervention show value."],
];

const dataView = [
  ["01", "Customer and account", "KYC profile, occupation, expected activity, source of funds, and linked accounts."],
  ["02", "Counterparty", "Known exchanges, traders, processors, repeated payees, and common beneficiaries."],
  ["03", "Channel and device", "Bank, mobile money, card, IP address, device, agent, and access location."],
  ["04", "Flow behaviour", "Collection, consolidation, pass-through, cash-out, and rapid cross-border movement."],
  ["05", "Economic purpose", "Invoice, goods, service, trade route, and an explanation consistent with the value moved."],
];

const filingQuestions = [
  "What activity would be expected from this customer, business, or transaction?",
  "What changed, and why is the deviation material rather than merely unusual?",
  "Who owns, controls, instructs, or benefits from the parties involved?",
  "How did value move across accounts, products, channels, and jurisdictions?",
  "What evidence supports the suspicion, and which links should the FIU test first?",
];

export default function EastAfricaAmlCftBriefPage() {
  return (
    <>
      <ReadingProgress />

      <article>
        <header className="system-grid relative overflow-hidden border-b border-white/15 bg-slate-dark text-white">
          <div className="mx-auto max-w-[1440px] px-5 py-14 sm:py-20 lg:px-8 lg:py-24">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              <Link href="/insights" className="transition-colors hover:text-signal">
                Insights / East Africa AML/CFT brief
              </Link>
              <span>Issue 01 / 13 July 2026</span>
            </div>

            <div className="grid gap-12 pt-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-3 border border-white/20 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-300">
                  <span className="h-2 w-2 bg-signal" />
                  SDS East Africa AML/CFT brief
                </div>
                <h1 className="mt-8 max-w-5xl text-[clamp(3.4rem,8vw,7.8rem)] font-semibold leading-[0.83] tracking-[-0.075em]">
                  EAST AFRICA&apos;S
                  <br />
                  AML/CFT TEST IS
                  <br />
                  <span className="text-signal">NOW EXECUTION.</span>
                </h1>
                <p className="mt-8 max-w-3xl font-serif text-xl leading-relaxed text-neutral-300 sm:text-2xl">
                  Grey-list remediation, virtual-asset exposure, and the intelligence value of reporting.
                </p>
              </div>

              <div className="lg:col-span-4">
                <div className="mb-10 flex h-44 items-end justify-end gap-2" aria-hidden>
                  {[42, 58, 48, 72, 62, 88, 78, 100].map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      className="w-5 bg-signal/75 sm:w-7"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="border-t border-white/20 pt-5">
                  <p className="text-sm font-semibold text-white">Richard Kabiru</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                    SDS analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
              {[
                ["Reporting date", "13 July 2026"],
                ["Geographic scope", "East Africa and the Horn"],
                ["Core audience", "Financial institutions, DNFBPs, and public authorities"],
              ].map(([label, value]) => (
                <div key={label} className="bg-slate-dark p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500">{label}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-200">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={pdfHref}
                download
                className="inline-flex items-center justify-between gap-12 border border-signal bg-signal px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-slate-dark transition-colors hover:bg-white"
              >
                Download the PDF <span aria-hidden>↓</span>
              </a>
              <a
                href="#listen"
                className="inline-flex items-center justify-between gap-12 border border-white/30 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-signal hover:text-signal"
              >
                Listen first <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </header>

        <section id="listen" className="scroll-mt-24 border-b border-neutral-300 bg-[#17261f] py-16 text-white sm:py-20">
          <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">
                  Listen to the brief
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-5xl">
                  Choose the depth that fits your time.
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-400">
                  Start with the concise briefing for the core argument. Continue with the debate for a deeper examination of how banks and DNFBPs contribute different forms of financial intelligence.
                </p>
              </div>

              <div className="grid gap-5 lg:col-span-8 md:grid-cols-2">
                <div className="flex flex-col justify-between border border-white/20 bg-white/[0.04] p-6 sm:p-7">
                  <div>
                    <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                      <span className="text-signal">Audio brief</span>
                      <span className="text-neutral-500">01:41</span>
                    </div>
                    <h3 className="mt-7 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                      Catching illicit money in East Africa
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                      A fast orientation to the brief&apos;s central finding and the controls that matter now.
                    </p>
                  </div>
                  <div className="mt-10">
                    <audio className="w-full" controls preload="metadata" style={{ colorScheme: "dark" }}>
                      <source src="/audio/east-africa-aml-cft-brief.m4a" type="audio/mp4" />
                      Your browser does not support audio playback.
                    </audio>
                    <a
                      href="/audio/east-africa-aml-cft-brief.m4a"
                      download
                      className="mt-4 inline-flex font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 hover:text-signal"
                    >
                      Download audio ↓
                    </a>
                  </div>
                </div>

                <div className="flex flex-col justify-between border border-signal/40 bg-signal/[0.06] p-6 sm:p-7">
                  <div>
                    <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                      <span className="text-signal">Extended debate</span>
                      <span className="text-neutral-500">21:47</span>
                    </div>
                    <h3 className="mt-7 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                      Banks versus DNFBPs for financial intelligence
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                      A longer discussion on transaction depth, ownership context, and what makes reporting useful to an FIU.
                    </p>
                  </div>
                  <div className="mt-10">
                    <audio className="w-full" controls preload="metadata" style={{ colorScheme: "dark" }}>
                      <source src="/audio/banks-vs-dnfbps-financial-intelligence-debate.m4a" type="audio/mp4" />
                      Your browser does not support audio playback.
                    </audio>
                    <a
                      href="/audio/banks-vs-dnfbps-financial-intelligence-debate.m4a"
                      download
                      className="mt-4 inline-flex font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400 hover:text-signal"
                    >
                      Download audio ↓
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="paper-grid bg-background">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8 lg:py-24">
            <aside className="lg:col-span-3">
              <nav className="border-y border-neutral-300 py-5 lg:sticky lg:top-24" aria-label="Brief chapters">
                <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">
                  In this brief
                </p>
                <ol>
                  {chapterLinks.map(([number, label, href]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="group grid grid-cols-[34px_1fr] gap-3 border-t border-neutral-300 py-3 text-sm text-neutral-600 transition-colors hover:text-jungle"
                      >
                        <span className="font-mono text-[10px] text-jungle">{number}</span>
                        <span>{label}</span>
                      </a>
                    </li>
                  ))}
                </ol>
                <a
                  href={pdfHref}
                  download
                  className="mt-5 flex items-center justify-between bg-slate-dark px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jungle"
                >
                  PDF edition <span aria-hidden>↓</span>
                </a>
              </nav>
            </aside>

            <div className="min-w-0 lg:col-span-9">
              <section id="executive" className="scroll-mt-24">
                <div className="signal-rule h-[3px]" />
                <p className="mt-7 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                  Executive perspective
                </p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  The formal position is largely unchanged. The burden of execution is not.
                </h2>
                <p className="mt-8 max-w-5xl font-serif text-xl leading-relaxed text-neutral-700 sm:text-2xl">
                  Kenya and South Sudan remain under FATF increased monitoring. Kenya&apos;s virtual-asset framework is still moving from legislation to supervision. On 8 July, the United Nations amended one entry on the ISIL and Al-Qaida sanctions list. Together, these developments point to a common regional problem. The rules are becoming clearer, but the quality of implementation remains uneven.
                </p>

                <div className="mt-10 grid gap-8 lg:grid-cols-2">
                  <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700">
                    <p>
                      For financial institutions, the immediate task is to convert policy into reliable data, working controls, and useful intelligence. Virtual-asset exposure may appear through personal accounts, mobile-money collections, processors, and offshore providers.
                    </p>
                    <p>
                      DNFBPs face the same problem from a different position. They may see fewer transactions than banks, but often hold better information on ownership, authority, source of funds, and commercial purpose.
                    </p>
                    <p>
                      Institutions now need to show how a change in policy affected customer behaviour, payment routes, report quality, and the ability to act.
                    </p>
                  </div>
                  <div>
                    <div className="bg-slate-dark p-7 text-white sm:p-8">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">
                        SDS assessment
                      </p>
                      <p className="mt-5 font-serif text-2xl leading-tight">
                        The next phase of AML/CFT reform will be judged less by the number of rules adopted and more by the quality of supervision, intelligence, and enforcement they produce.
                      </p>
                    </div>
                    <div className="border-l-4 border-signal bg-white p-6">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">
                        A note for DNFBPs
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        DNFBPs include designated non-financial businesses and professions such as lawyers, accountants, real-estate actors, dealers in precious metals and stones, casinos, and trust or company service providers, subject to national law.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid border-l border-t border-neutral-300 md:grid-cols-3">
                  {findings.map((finding) => (
                    <div key={finding.number} className="border-b border-r border-neutral-300 bg-white p-6">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-jungle">
                        Finding {finding.number}
                      </span>
                      <h3 className="mt-5 text-xl font-semibold leading-tight tracking-[-0.025em]">{finding.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{finding.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <div className="flex items-end justify-between gap-6 border-b border-neutral-300 pb-4">
                    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                      Questions for management
                    </h3>
                    <span className="hidden font-serif text-sm text-neutral-500 sm:block">For compliance, risk, and board reporting.</span>
                  </div>
                  <div className="grid border-l border-neutral-300 md:grid-cols-2">
                    {managementQuestions.map(([number, question, answer]) => (
                      <div key={number} className="grid grid-cols-[34px_1fr] gap-3 border-b border-r border-neutral-300 bg-white p-5">
                        <span className="font-mono text-[10px] font-semibold text-jungle">{number}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{question}</p>
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="increased-monitoring" className="scroll-mt-24 border-t border-neutral-400 pt-16 mt-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                  01 / Increased monitoring
                </p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  Grey-list remediation will be judged by the connection between supervision, intelligence, and enforcement.
                </h2>

                <div className="mt-10 grid gap-10 lg:grid-cols-12">
                  <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700 lg:col-span-7">
                    <p>
                      FATF&apos;s statement of 19 June 2026 retained Kenya and South Sudan among jurisdictions under increased monitoring. This is not a direction to reject every customer, payment, or business relationship linked to either jurisdiction. A risk-based approach requires institutions to distinguish jurisdictional weakness from the risk presented by a specific customer or transaction.
                    </p>
                    <p>
                      Kenya&apos;s remaining action areas form a single operating chain covering risk-based supervision, STR quality, beneficial ownership, use of financial intelligence, money-laundering investigations, targeted financial sanctions, and oversight of non-profit organisations.
                    </p>
                    <p>
                      South Sudan requires a different analytical response. Institutional constraints and exposure to cash, procurement, and politically connected networks support greater use of relationship and network analysis.
                    </p>
                  </div>
                  <div className="lg:col-span-5">
                    <blockquote className="border-y border-neutral-400 py-6 font-serif text-3xl leading-tight text-foreground">
                      A grey list identifies a jurisdictional weakness. It does not determine the risk of every customer.
                    </blockquote>
                    <div className="grid grid-cols-2 gap-px bg-neutral-300 mt-6">
                      <div className="bg-background p-5">
                        <strong className="block text-5xl text-jungle">7</strong>
                        <span className="mt-2 block text-xs leading-relaxed text-neutral-600">Reform areas that need to operate as one control chain.</span>
                      </div>
                      <div className="bg-background p-5">
                        <strong className="block text-5xl text-jungle">3</strong>
                        <span className="mt-2 block text-xs leading-relaxed text-neutral-600">Practical tests covering supervision, intelligence use, and enforcement outcomes.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 overflow-x-auto border border-neutral-300 bg-white">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead className="bg-neutral-100 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-600">
                      <tr>
                        <th className="border-b border-neutral-300 p-4">Jurisdiction</th>
                        <th className="border-b border-neutral-300 p-4">Primary execution gap</th>
                        <th className="border-b border-neutral-300 p-4">Implication for institutions</th>
                      </tr>
                    </thead>
                    <tbody className="text-neutral-700">
                      {[
                        ["Kenya", "Converting reform into better reporting, ownership resolution, and case outcomes.", "Track report quality, linkage, ownership enrichment, dissemination, and investigative use."],
                        ["South Sudan", "Capacity constraints and high exposure to cash, procurement, and politically connected networks.", "Prioritise common controllers, repeated counterparties, oil intermediaries, NGO contractors, and regional property."],
                        ["Regional institutions", "Pressure to use broad de-risking instead of customer-level analysis.", "Document the risk drivers and apply proportionate enhanced measures."],
                      ].map((row) => (
                        <tr key={row[0]} className="border-b border-neutral-300 last:border-b-0">
                          <th className="p-4 align-top font-semibold text-foreground">{row[0]}</th>
                          <td className="p-4 align-top leading-relaxed">{row[1]}</td>
                          <td className="p-4 align-top leading-relaxed">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 border-l-4 border-signal bg-white p-6">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">The policy error</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    Broad de-risking is administratively simple but analytically weak. It can move activity into smaller institutions, informal channels, and less transparent payment routes while leaving the underlying risk intact.
                  </p>
                </div>

                <div className="mt-12">
                  <div className="flex flex-col justify-between gap-2 border-b border-neutral-300 pb-4 sm:flex-row sm:items-end">
                    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">A practical effectiveness dashboard</h3>
                    <span className="font-serif text-sm text-neutral-500">Trend by sector and reporting institution.</span>
                  </div>
                  <div className="overflow-x-auto border-x border-neutral-300 bg-white">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                      <thead className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
                        <tr>
                          <th className="border-b border-neutral-300 p-4">Indicator</th>
                          <th className="border-b border-neutral-300 p-4">What it shows</th>
                          <th className="border-b border-neutral-300 p-4">Weak performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Identifier completeness", "The ability to match subjects, accounts, and counterparties without manual reconstruction.", "High report volume with missing, inconsistent, or unreliable identifiers."],
                          ["Ownership resolution", "The ability to identify the natural person who owns or controls the customer, company, or asset.", "Legal persons reported repeatedly without controller-level information."],
                          ["Network linkage", "The share of reports connected to prior subjects, beneficiaries, devices, addresses, or transactions.", "Reports remain isolated despite recurring names and counterparties."],
                          ["Analytical conversion", "The share of reporting that supports enrichment, dissemination, investigation, or another risk action.", "Submission counts increase while downstream use remains flat."],
                        ].map((row) => (
                          <tr key={row[0]} className="border-b border-neutral-300">
                            <th className="p-4 align-top font-semibold">{row[0]}</th>
                            <td className="p-4 align-top leading-relaxed text-neutral-600">{row[1]}</td>
                            <td className="p-4 align-top leading-relaxed text-neutral-600">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section id="virtual-assets" className="scroll-mt-24 border-t border-neutral-400 pt-16 mt-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                  02 / Regulatory transition
                </p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  Virtual-asset exposure is becoming an ordinary-payments problem.
                </h2>

                <div className="mt-10 grid gap-10 lg:grid-cols-12">
                  <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700 lg:col-span-6">
                    <p>
                      Kenya&apos;s draft Virtual Asset Service Providers Regulations signal the direction of travel. They do not, by themselves, give reporting institutions a complete view of exposure during the transition to licensing and supervision.
                    </p>
                    <p>
                      Most customers will not present as virtual-asset users. Exposure may be routed through personal bank accounts, mobile-money collections, informal peer-to-peer traders, payment processors, offshore exchanges, and merchants that use stablecoins for settlement.
                    </p>
                    <p>
                      Differences in regulatory timing across Kenya, Uganda, Rwanda, and Tanzania create scope for substitution. Customers and providers can shift to the jurisdiction, platform, or payment corridor that presents the least friction, while the underlying economic activity remains regional.
                    </p>
                    <p>
                      Transaction monitoring should therefore begin with behaviour and relationships, not product labels.
                    </p>
                  </div>
                  <div className="border border-neutral-300 bg-white p-6 lg:col-span-6 sm:p-8">
                    <p className="text-center text-xs font-semibold text-foreground">Customers and providers select the lowest-friction corridor</p>
                    <div className="mt-8 grid grid-cols-2 gap-4 text-center text-xs">
                      <div className="border border-neutral-400 p-4"><strong className="block">Offshore VASP</strong><span className="mt-1 block text-[10px] text-neutral-500">Exchange / wallet / OTC</span></div>
                      <div className="border border-neutral-400 p-4"><strong className="block">Uganda</strong><span className="mt-1 block text-[10px] text-neutral-500">Banks / PSPs / traders</span></div>
                      <div className="col-span-2 mx-auto w-1/2 min-w-40 bg-slate-dark p-5 text-white"><strong className="block text-signal">Kenya</strong><span className="mt-1 block text-[10px] text-neutral-400">Banks / mobile money / P2P</span></div>
                      <div className="border border-neutral-400 p-4"><strong className="block">Tanzania</strong><span className="mt-1 block text-[10px] text-neutral-500">P2P / FX / merchants</span></div>
                      <div className="border border-neutral-400 p-4"><strong className="block">Rwanda</strong><span className="mt-1 block text-[10px] text-neutral-500">Licensed perimeter / fintech</span></div>
                    </div>
                    <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">Risk migrates before supervisory practice converges</p>
                  </div>
                </div>

                <div className="mt-12 grid border-l border-t border-neutral-300 md:grid-cols-3">
                  {[
                    ["Retail collection accounts", "Numerous incoming payments are consolidated and transferred to a provider, trader, or common beneficiary soon after receipt."],
                    ["Misstated payment purpose", "Payments are described as imports, gaming, consulting, or online services, but invoices and account behaviour do not support the explanation."],
                    ["Fiat on- and off-ramps", "Value moves outside the visible banking chain while cash, bank, or mobile-money conversion occurs at the entry and exit points."],
                  ].map(([title, text]) => (
                    <div key={title} className="border-b border-r border-neutral-300 bg-white p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-jungle">Pattern</p>
                      <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em]">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <div className="flex flex-col justify-between gap-2 border-b border-neutral-300 pb-4 sm:flex-row sm:items-end">
                    <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">Minimum data view for VASP exposure</h3>
                    <span className="font-serif text-sm text-neutral-500">Start with a usable view before adding complex models.</span>
                  </div>
                  <div className="grid border-l border-neutral-300 sm:grid-cols-2 lg:grid-cols-5">
                    {dataView.map(([number, title, text]) => (
                      <div key={number} className="border-b border-r border-t-2 border-t-jungle bg-white p-5">
                        <span className="font-mono text-[10px] text-jungle">{number}</span>
                        <h4 className="mt-4 text-sm font-semibold">{title}</h4>
                        <p className="mt-3 text-xs leading-relaxed text-neutral-600">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="intelligence-yield" className="scroll-mt-24 border-t border-neutral-400 pt-16 mt-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">03 / Intelligence yield</p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  STR growth matters only when the reports can be converted into intelligence.
                </h2>

                <div className="mt-10 grid gap-10 lg:grid-cols-12">
                  <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700 lg:col-span-7">
                    <p>
                      Grey-list remediation often increases filing volumes. Institutions become more cautious, supervisors ask for evidence of compliance, and borderline cases are escalated. This may be rational in the short term, but it can also increase the number of reports without improving their analytical value.
                    </p>
                    <p>
                      A useful STR does three things. It identifies the parties with enough precision to support matching. It explains how the activity differs from the customer&apos;s known profile or stated purpose. It provides enough transaction and ownership detail for the FIU to test links, reconstruct the movement of value, and assess the wider network.
                    </p>
                    <p>
                      Banks and payment firms can contribute transaction depth. DNFBPs can contribute context on ownership, legal authority, property, source of funds, and the commercial purpose of a transaction.
                    </p>
                    <p>
                      The relevant performance question is not how many reports were filed. It is how many could be enriched, linked, disseminated, and used.
                    </p>
                  </div>
                  <div className="border border-neutral-300 bg-white p-6 lg:col-span-5 sm:p-8">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">The intelligence value chain</p>
                    <div className="mt-7 space-y-3">
                      {[
                        ["1", "Report received", "bg-slate-dark text-white"],
                        ["2", "Identifiers + transactions", "bg-[#1e704d] text-white"],
                        ["3", "Ownership + counterparties", "bg-[#4e926e] text-white"],
                        ["4", "Network + typology", "bg-[#8abd9f] text-white"],
                        ["5", "Actionable", "bg-signal text-slate-dark"],
                      ].map(([number, label, className], index) => (
                        <div key={number} className={`mx-auto p-3 text-center text-[10px] font-bold uppercase tracking-[0.1em] ${className}`} style={{ width: `${100 - index * 10}%` }}>
                          {number}. {label}
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-center text-[10px] leading-relaxed text-neutral-500">Each missing field reduces the probability that a report survives the path from filing to investigative use.</p>
                  </div>
                </div>

                <div className="mt-12 border border-neutral-300 bg-white p-6 sm:p-8">
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">Five questions before filing</h3>
                  <ol className="mt-6 grid gap-px bg-neutral-300 md:grid-cols-2">
                    {filingQuestions.map((question, index) => (
                      <li key={question} className="grid grid-cols-[36px_1fr] gap-3 bg-white p-5">
                        <span className="font-mono text-xs font-semibold text-jungle">0{index + 1}</span>
                        <span className="text-sm leading-relaxed text-neutral-700">{question}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 font-serif text-lg font-semibold">A concise report can still be complete. A vague report cannot.</p>
                </div>

                <div className="mt-10 grid border-l border-t border-neutral-300 md:grid-cols-3">
                  {[
                    ["Data sufficiency", "Names, identification numbers, accounts, contacts, addresses, and ownership links that can be matched reliably."],
                    ["Linkage potential", "The extent to which a report can be connected to other subjects, transactions, locations, devices, or prior intelligence."],
                    ["Downstream utility", "Dissemination, investigative uptake, restraint, recovery, prosecution, or another documented risk intervention."],
                  ].map(([title, text]) => (
                    <div key={title} className="border-b border-r border-neutral-300 bg-white p-6">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">Measure</p>
                      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-600">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-dark p-7 text-white sm:p-8">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">Analytical judgement</p>
                  <p className="mt-4 font-serif text-xl leading-relaxed">Defensive filing moves uncertainty from the reporting institution to the FIU. It does not improve the quality of the underlying information.</p>
                </div>
              </section>

              <section id="network-analysis" className="scroll-mt-24 border-t border-neutral-400 pt-16 mt-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">04 / Network analysis</p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  Terrorist-financing analysis should follow the commercial network, not the payment product.
                </h2>

                <div className="mt-10 grid gap-10 lg:grid-cols-12">
                  <div className="border border-neutral-300 bg-white p-6 lg:col-span-6 sm:p-8">
                    <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                      {[
                        ["Remittances", "Family / diaspora / agents"],
                        ["Extortion", "Taxation / collections"],
                        ["Logistics", "Transport / warehousing"],
                        ["Livestock", "Trade / markets / levies"],
                        ["Operational financing", "Network, not one channel"],
                        ["Fuel + telecom", "Services / airtime / access"],
                        ["Small business", "Fronts / merchant flows"],
                        ["Charities", "Beneficiaries / contractors"],
                        ["Procurement", "Chemicals / electronics"],
                      ].map(([title, text], index) => (
                        <div key={title} className={`flex min-h-24 flex-col items-center justify-center p-3 ${index === 4 ? "rounded-full bg-slate-dark text-white" : "border border-neutral-400 bg-neutral-50"}`}>
                          <strong className={index === 4 ? "text-signal" : "text-foreground"}>{title}</strong>
                          <span className={`mt-1 text-[9px] leading-tight ${index === 4 ? "text-neutral-400" : "text-neutral-500"}`}>{text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-500">Operational financing is a network, not one channel</p>
                  </div>

                  <div className="space-y-5 font-serif text-lg leading-relaxed text-neutral-700 lg:col-span-6">
                    <p>
                      Al-Shabaab-related risk is regional because revenue collection, movement, procurement, and commercial support extend beyond Somalia. Kenya, Ethiopia, Djibouti, Uganda, and Tanzania can appear within the same financial or supply chain.
                    </p>
                    <p>
                      Remittances remain relevant, but they are neither unusual nor distinctive on their own. The wider picture may include taxation and extortion, transport, livestock and agricultural trade, fuel, telecommunications, small-business fronts, and procurement.
                    </p>
                    <p>
                      A single sender or transfer is rarely sufficient. Greater weight should be placed on repeated beneficiaries, linked merchants, common controllers, border locations, procurement patterns, and activity that conflicts with the stated business.
                    </p>
                    <p>
                      A network-based approach can also reduce false positives. Analytical confidence increases when transaction behaviour is supported by network, geographic, ownership, and commercial indicators.
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  {[
                    ["Transaction behaviour", "Splitting, rapid pass-through, unusual cash conversion, repeated merchant collections, or unexplained cross-border settlement."],
                    ["Network and control", "Common controllers, repeated beneficiaries, shared devices, linked merchants, border locations, or circular flows."],
                    ["Commercial contradiction", "Activity inconsistent with the stated business, trade route, procurement need, customer profile, or source of funds."],
                  ].map(([title, text], index) => (
                    <div key={title} className="border-l-4 bg-white p-5" style={{ borderColor: index === 0 ? "#1e704d" : index === 1 ? "#69b68b" : "#dfff55" }}>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-neutral-500">No single indicator establishes terrorist financing. Confidence increases when independent sources point to the same explanation.</p>

                <div className="mt-10 border-l-4 border-signal bg-white p-6">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-jungle">Sanctions control</p>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    The UN amended entry QDi.439 on 8 July 2026. Institutions should update machine-readable list data, validate field mapping, test aliases and transliterations, and rescreen affected activity. Vendor confirmation should not replace internal evidence that the update was applied correctly.
                  </p>
                </div>
              </section>

              <section id="control-agenda" className="scroll-mt-24 border-t border-neutral-400 pt-16 mt-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">05 / Control agenda</p>
                <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                  Institutions should focus the response on control weaknesses they can measure.
                </h2>
                <div className="mt-10">
                  <ControlAgenda />
                </div>

                <div className="mt-8 bg-slate-dark p-7 text-white sm:p-10">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-signal">The test</p>
                  <p className="mt-5 font-serif text-2xl leading-relaxed">
                    A control should be judged by what it enables: better identification of risk, a clearer explanation of activity, or a timely intervention. Controls that add paperwork without improving any of these outcomes deserve review.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>

        <section className="system-grid bg-slate-dark py-20 text-white sm:py-24">
          <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-signal">What to watch next</p>
            <h2 className="mt-5 max-w-5xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-6xl">
              The next signal is likely to appear in implementation data before it appears in another headline.
            </h2>
            <div className="mt-12 grid gap-10 lg:grid-cols-12">
              <div className="grid gap-4 lg:col-span-7">
                {[
                  ["01", "Kenyan VASP regulations", "Final rules, licensing mechanics, supervisory allocation, and the treatment of customers and providers during the transition period."],
                  ["02", "FATF remediation evidence", "Changes in STR quality, beneficial-ownership access, sanctions implementation, investigations, prosecutions, and asset outcomes."],
                  ["03", "Regional enforcement patterns", "Cases involving virtual assets, mobile money, trade, property, professional intermediaries, and cross-border payment corridors."],
                ].map(([number, title, text]) => (
                  <div key={number} className="grid grid-cols-[38px_1fr] gap-4 border border-white/20 bg-white/[0.03] p-5 sm:p-6">
                    <span className="font-mono text-xs text-signal">{number}</span>
                    <div>
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <p className="font-serif text-4xl leading-tight">East Africa&apos;s AML/CFT frameworks are becoming denser. The remaining gap is execution.</p>
                <div className="mt-8 h-[3px] bg-signal" />
                <p className="mt-8 font-serif text-lg leading-relaxed text-neutral-300">
                  For management, the question is no longer simply if a policy exists. The question is whether the institution can show, from its own data, that the policy is changing what it detects and how it responds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-b border-neutral-300 bg-neutral-50 py-16">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">Selected public sources</h2>
              <ol className="mt-6 space-y-3 font-serif text-sm leading-relaxed text-neutral-600">
                <li>1. Financial Action Task Force, Jurisdictions under Increased Monitoring, 19 June 2026.</li>
                <li>2. Central Bank of Kenya, Invitation for Comments on the Draft Virtual Asset Service Providers Regulations, 2026, 18 March 2026.</li>
                <li>3. United Nations Security Council, List of updates to the UNSC Consolidated List, entry QDi.439 amended 8 July 2026.</li>
                <li>
                  4. Financial Action Task Force, {" "}
                  <a href="https://www.fatf-gafi.org/en/publications/Fatfgeneral/Effectiveness.html" target="_blank" rel="noopener noreferrer" className="underline decoration-neutral-400 underline-offset-4 hover:text-jungle">
                    An Effective System to Combat Money Laundering and Terrorist Financing
                  </a>.
                </li>
                <li>
                  5. Financial Action Task Force, {" "}
                  <a href="https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Aml-cft-related-data-statistics.html" target="_blank" rel="noopener noreferrer" className="underline decoration-neutral-400 underline-offset-4 hover:text-jungle">
                    Guidance on AML/CFT-related Data and Statistics
                  </a>.
                </li>
                <li>6. Public regulatory and sanctions material reviewed for the reporting period ending 13 July 2026.</li>
              </ol>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">About the author</h2>
              <p className="mt-5 text-lg font-semibold">Richard Kabiru</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">Richard works across financial intelligence, AML/CFT, data analytics, and systems design.</p>
              <h3 className="mt-8 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Method + disclaimer</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                This publication separates confirmed public developments from the author&apos;s analytical judgement. It does not represent the position of any public institution and is not legal or regulatory advice.
              </p>
              <a href={pdfHref} download className="mt-7 inline-flex border-b border-jungle pb-1 text-xs font-bold uppercase tracking-[0.1em] text-jungle hover:border-slate-dark hover:text-slate-dark">
                Download the original PDF <span className="ml-6" aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}
