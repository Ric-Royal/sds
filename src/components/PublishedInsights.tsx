"use client";

import { useEffect, useState } from "react";
import { OPERATIONS_ORIGIN } from "@/lib/operations";
type Article = { id: string; title: string; summary: string; content: string; published_at: string };

export default function PublishedInsights() {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${OPERATIONS_ORIGIN}/v2/publications`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setArticles(data.publications || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  if (!articles.length) return null;
  return <section className="border-b border-neutral-300 bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-jungle">SDS operating desk</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">Latest approved research and updates.</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">{articles.map(article => <article key={article.id} className="border border-neutral-300 p-6 sm:p-8">
        <time className="text-xs text-neutral-500" dateTime={article.published_at}>{new Date(article.published_at).toLocaleDateString("en-KE", { timeZone: "Africa/Nairobi", year: "numeric", month: "long", day: "numeric" })}</time>
        <h3 className="mt-4 text-2xl font-semibold">{article.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">{article.summary}</p>
        <details className="mt-6"><summary className="cursor-pointer text-sm font-semibold text-jungle">Read the full article</summary><div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed">{article.content}</div></details>
      </article>)}</div>
    </div>
  </section>;
}
