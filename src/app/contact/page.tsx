"use client";

import { useRef, useState, type FormEvent } from "react";
import { CUSTOMER_PORTAL, OPERATIONS_ORIGIN } from "@/lib/operations";
import IntakeVerification from "@/components/IntakeVerification";

const contactChannels = [
  {
    label: "Start a project",
    email: "contact@datasds.org",
    description: "Project briefs, consultation requests, and new work.",
  },
  {
    label: "General information",
    email: "info@datasds.org",
    description: "Partnerships, capabilities, and general questions.",
  },
  {
    label: "Accounts",
    email: "accounts@datasds.org",
    description: "Invoices, procurement, payments, and supplier records.",
  },
];

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{id:string;accessKey:string}|null>(null);
  const [error, setError] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const submission = useRef<{ fingerprint: string; key: string } | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = field(formData, "name");
    const email = field(formData, "email");
    const organisation = field(formData, "organisation") || "Not provided";
    const interest = field(formData, "interest") || "Not selected";
    const message = field(formData, "message");
    setSubmitting(true);setError("");
    try {
      const payload = {name,email,organisation,title:`${interest}: ${organisation === "Not provided" ? name : organisation}`,
        service:interest === "Research and advisory" ? "research-report" : interest === "Risk and compliance" ? "governance-review" : ["Applied AI and NLP", "Institutional data platforms"].includes(interest) ? "system-build" : "analytics-plan",
        brief:message,consent:formData.get("consent")==="on"};
      const fingerprint = JSON.stringify(payload);
      if (submission.current?.fingerprint !== fingerprint) submission.current = {fingerprint,key:crypto.randomUUID()};
      const response = await fetch(`${OPERATIONS_ORIGIN}/v2/enquiries`, {
        method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":submission.current.key},
        body:JSON.stringify({...payload,turnstile_token:verificationToken})
      });
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Your enquiry could not be recorded.");
      setResult({id:data.project.id,accessKey:data.access_key});
    } catch(error) {setError(error instanceof Error?error.message:"Your enquiry could not be recorded. Please contact contact@datasds.org.");}
    finally{setSubmitting(false);}
  }

  return (
    <>
      <section className="border-b border-neutral-300 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                Contact SDS
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-foreground sm:text-7xl">
                Start with the decision that needs to improve.
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-neutral-600 lg:col-span-4 lg:justify-self-end">
              Bring us the problem that is costing your team time, visibility, or confidence. We will help you determine what data, research, or system is actually needed.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-7">
            <div className="mb-8 border-b border-neutral-300 pb-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
                Project brief
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground">
                Give us enough context to make the first conversation useful.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" hidden={!!result}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-2 block w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:outline-none focus:ring-1 focus:ring-jungle"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Work email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-2 block w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:outline-none focus:ring-1 focus:ring-jungle"
                    placeholder="you@organisation.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organisation" className="block text-sm font-medium text-foreground">
                  Organisation
                </label>
                <input
                  type="text"
                  id="organisation"
                  name="organisation"
                  className="mt-2 block w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:outline-none focus:ring-1 focus:ring-jungle"
                  placeholder="Company, institution, or team"
                />
              </div>

              <div>
                <label htmlFor="interest" className="block text-sm font-medium text-foreground">
                  Where do you need help?
                </label>
                <select
                  id="interest"
                  name="interest"
                  className="mt-2 block w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground focus:border-jungle focus:outline-none focus:ring-1 focus:ring-jungle"
                >
                  <option value="">Select an area</option>
                  <option value="Data analytics and BI">Data analytics and BI</option>
                  <option value="Managed analytics">Managed analytics</option>
                  <option value="Institutional data platforms">Institutional data platforms</option>
                  <option value="Applied AI and NLP">Applied AI and NLP</option>
                  <option value="Research and advisory">Research and advisory</option>
                  <option value="Risk and compliance">Risk and compliance</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  What decision, process, or risk needs to improve?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="mt-2 block w-full resize-none border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:outline-none focus:ring-1 focus:ring-jungle"
                  placeholder="Share the current situation, who needs the result, and what a useful outcome would look like."
                />
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center border border-slate-dark bg-slate-dark px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jungle"
                >
                  {submitting ? "Recording your brief…" : "Submit project brief"} <span className="ml-8" aria-hidden>↗</span>
                </button>
                <p className="max-w-sm text-xs leading-relaxed text-neutral-500">
                  Your brief creates an SDS project. You receive a tracking ID and private workspace key.
                </p>
              </div>
              <IntakeVerification onToken={setVerificationToken} />
              <label className="flex items-start gap-3 text-xs leading-relaxed text-neutral-600">
                <input type="checkbox" name="consent" required className="mt-1" />
                <span>I may share this information with SDS for this enquiry. SDS stores the brief and contact details to provide the service. <a href={`${CUSTOMER_PORTAL}#data-notice`} className="underline">Read the data notice.</a></span>
              </label>
            </form>
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            {result && <section className="border border-jungle bg-white p-6" aria-live="polite">
              <h3 className="text-2xl font-semibold">Your enquiry is recorded.</h3>
              <p className="mt-3 text-sm">Project: {result.id}</p>
              <p className="mt-4 text-sm">Save this private access key. You will need it to open your workspace, review your quote and receive results.</p>
              <textarea readOnly value={result.accessKey} aria-label="Your private SDS workspace key" className="mt-3 w-full border border-neutral-300 p-3 font-mono text-sm" rows={3}/>
              <button type="button" className="mt-4 border border-jungle px-5 py-3 text-sm" onClick={()=>{
                const url=URL.createObjectURL(new Blob([`SDS workspace access key\n${result.accessKey}\n\nWorkspace: ${CUSTOMER_PORTAL}\nProject: ${result.id}\nKeep this key private.\n`],{type:"text/plain"}));
                const a=document.createElement("a");a.href=url;a.download="SDS_Access_Key.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
              }}>Download access key</button>
              <a href={CUSTOMER_PORTAL} className="ml-4 inline-block bg-jungle px-5 py-3 text-sm text-white">Open your workspace ↗</a>
            </section>}
          </div>

          <aside className="lg:col-span-5 lg:border-l lg:border-neutral-300 lg:pl-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-jungle">
              Route your message
            </p>
            <div className="mt-5 border-t border-neutral-300">
              {contactChannels.map((channel, index) => (
                <a
                  key={channel.email}
                  href={`mailto:${channel.email}`}
                  className="group grid grid-cols-[42px_1fr] gap-4 border-b border-neutral-300 py-6 transition-colors hover:bg-white sm:px-3"
                >
                  <span className="font-mono text-xs text-jungle">0{index + 1}</span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{channel.label}</span>
                    <span className="mt-1 block font-mono text-sm text-jungle group-hover:underline">
                      {channel.email}
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-neutral-500">
                      {channel.description}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-10 border border-neutral-300 bg-white p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">Based in</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Nairobi, Kenya</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                We work with organisations across East Africa and with distributed teams beyond the region.
              </p>
              <a
                href="mailto:contact@datasds.org?subject=Consultation%20request"
                className="mt-6 inline-flex border-b border-jungle pb-1 text-xs font-bold uppercase tracking-[0.1em] text-jungle transition-colors hover:border-slate-dark hover:text-slate-dark"
              >
                Request a consultation
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
