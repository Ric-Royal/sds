"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const contactInfo = [
  {
    label: "Email",
    value: "info@sdscompany.com",
    href: "mailto:info@sdscompany.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+254 700 000 000",
    href: "tel:+254700000000",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/company/sds",
    href: "https://linkedin.com",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Location",
    value: "Nairobi, Kenya",
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-jungle">
              Contact
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Let&apos;s start with a conversation.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-500">
              Whether you have a specific project in mind or want to explore how
              SDS can help, reach out. We respond within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="border-t border-neutral-100 bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="rounded-xl border border-jungle/20 bg-jungle/5 p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-jungle/10 text-jungle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    Message sent
                  </h3>
                  <p className="mt-2 text-sm text-neutral-500">
                    Thank you for reaching out. We&apos;ll respond within one
                    business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:ring-1 focus:ring-jungle focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:ring-1 focus:ring-jungle focus:outline-none"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="organisation"
                      className="block text-sm font-medium text-foreground"
                    >
                      Organisation
                    </label>
                    <input
                      type="text"
                      id="organisation"
                      name="organisation"
                      className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:ring-1 focus:ring-jungle focus:outline-none"
                      placeholder="Your company or organisation"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="interest"
                      className="block text-sm font-medium text-foreground"
                    >
                      Area of Interest
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-foreground focus:border-jungle focus:ring-1 focus:ring-jungle focus:outline-none"
                    >
                      <option value="">Select an area</option>
                      <option value="analytics">Data Analytics & BI</option>
                      <option value="ai">Applied AI & NLP</option>
                      <option value="research">Research & Advisory</option>
                      <option value="risk">Risk & Compliance</option>
                      <option value="other">Other / Not sure yet</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-jungle focus:ring-1 focus:ring-jungle focus:outline-none resize-none"
                      placeholder="Tell us about your project or question"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-jungle px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-jungle-dark"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground">
                Contact Details
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Prefer to reach out directly? Use any of the channels below.
              </p>

              <div className="mt-8 space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jungle/10 text-jungle">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {info.label}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          target={info.href.startsWith("http") ? "_blank" : undefined}
                          rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-sm text-neutral-500 hover:text-jungle transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-neutral-500">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-xl border border-neutral-200 bg-white p-6">
                <h3 className="text-base font-semibold text-foreground">
                  Book a Consultation
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  Want to discuss a specific challenge? We offer a free initial
                  consultation to understand your needs and explore whether SDS
                  is the right fit.
                </p>
                <a
                  href="mailto:info@sdscompany.com?subject=Consultation%20Request"
                  className="mt-4 inline-flex items-center text-sm font-medium text-jungle hover:text-jungle-dark transition-colors"
                >
                  Request a consultation &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
