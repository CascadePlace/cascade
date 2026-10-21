"use client";

// AI-IDE dev tooling. Rendered only in development (layout gates on NODE_ENV)
// so it never ships to production. Forwards runtime console errors/warnings +
// failed requests to the embedding IDE, and provides review-mode element
// picking. Safe to delete together with its use in layout.tsx.

import { useEffect } from "react";

type LogEvent = { level: string; text: string; ts: number; url?: string };

export function AiideDevBridge() {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    let parentOrigin = "";
    try {
      parentOrigin = document.referrer ? new URL(document.referrer).origin : "";
    } catch {
      parentOrigin = "";
    }
    if (!parentOrigin) return; // no known embedder → don't emit anywhere

    const queue: LogEvent[] = [];
    const fmt = (a: unknown): string => {
      if (a instanceof Error) return a.stack || a.message;
      if (a && typeof a === "object") {
        try {
          return JSON.stringify(a);
        } catch {
          return String(a);
        }
      }
      return String(a);
    };
    const push = (level: string, text: string, url?: string) => {
      if (!text) return;
      queue.push({ level, text: String(text).slice(0, 2000), ts: Date.now(), url });
      if (queue.length >= 50) flush();
    };
    const flush = () => {
      if (!queue.length) return;
      const events = queue.splice(0, queue.length);
      try {
        window.parent.postMessage(
          { source: "aiide-preview", type: "browser-log", events },
          parentOrigin
        );
      } catch {
        /* parent gone */
      }
    };
    const timer = window.setInterval(flush, 1000);

    const origError = console.error;
    const origWarn = console.warn;
    console.error = (...args: unknown[]) => {
      try {
        push("error", args.map(fmt).join(" "));
      } catch {
        /* ignore */
      }
      return origError.apply(console, args as []);
    };
    console.warn = (...args: unknown[]) => {
      try {
        push("warn", args.map(fmt).join(" "));
      } catch {
        /* ignore */
      }
      return origWarn.apply(console, args as []);
    };
    const onError = (ev: ErrorEvent) =>
      push(
        "unhandled",
        (ev.message || "error") +
          (ev.filename ? ` @ ${ev.filename}:${ev.lineno}` : "")
      );
    const onRejection = (ev: PromiseRejectionEvent) => {
      const r = ev.reason as { stack?: string; message?: string } | undefined;
      push("unhandled", "Unhandled rejection: " + ((r && (r.stack || r.message)) || r));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const origFetch = window.fetch;
    window.fetch = function (...args: Parameters<typeof fetch>) {
      const first = args[0] as { url?: string } | string;
      const u = typeof first === "string" ? first : first?.url ?? "";
      return origFetch
        .apply(this, args)
        .then((res) => {
          if (res && !res.ok) push("network", `HTTP ${res.status}`, String(u));
          return res;
        })
        .catch((err: { message?: string }) => {
          push("network", "fetch failed: " + (err?.message || err), String(u));
          throw err;
        });
    };

    return () => {
      window.clearInterval(timer);
      flush();
      console.error = origError;
      console.warn = origWarn;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.fetch = origFetch;
    };
  }, []);

  return null;
}
