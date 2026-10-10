"use client";

import { useEffect, useRef } from "react";
import { OPERATIONS_ORIGIN } from "@/lib/operations";
type Challenge = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: Challenge } }

export default function IntakeVerification({ onToken }: { onToken: (token: string) => void }) {
  const target = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false, widget: string | undefined;
    const controller = new AbortController();
    fetch(`${OPERATIONS_ORIGIN}/v2/catalogue`, { signal: controller.signal }).then(r => r.json()).then(async data => {
      if (!data.turnstile_site_key || cancelled) return;
      if (!window.turnstile) await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-sds-turnstile]');
        if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
        const script = document.createElement("script");script.dataset.sdsTurnstile = "true";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.onload = () => resolve();script.onerror = reject;document.head.append(script);
      });
      if (!cancelled && target.current && window.turnstile) widget = window.turnstile.render(target.current, { sitekey: data.turnstile_site_key, callback: onToken, "expired-callback": () => onToken(""), "error-callback": () => onToken("") });
    }).catch(() => {});
    return () => { cancelled = true;controller.abort();if (widget && window.turnstile) window.turnstile.remove(widget); };
  }, [onToken]);
  return <div ref={target} aria-label="Enquiry verification" />;
}
