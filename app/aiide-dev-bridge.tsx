"use client";

// AI-IDE dev tooling. When this app runs inside the IDE's preview iframe, this
// (1) forwards runtime console errors/warnings + failed requests up to the IDE
// so the coding agent can see client-side problems, and (2) provides "review
// mode": when the IDE turns it on, hovering outlines the element under the
// cursor and clicking it sends a stable selector + label back to the IDE, which
// opens a comment box; committed comments are drawn as numbered pins.
//
// SAFETY: the ONLY inbound control channel is the review toggle, and it is
// accepted STRICTLY from the VALIDATED parent origin (from document.referrer) —
// it never runs code, only toggles picking + draws overlays. All outbound posts
// target that same validated origin. Rendered only in development (layout gates
// on NODE_ENV) so it never ships to production. Delete this file + its use in
// layout.tsx if you don't want it.

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

  // ── Review mode: element picker + numbered pins, driven by the IDE ──────────
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    let parentOrigin = "";
    try {
      parentOrigin = document.referrer ? new URL(document.referrer).origin : "";
    } catch {
      parentOrigin = "";
    }
    if (!parentOrigin) return; // no known embedder → no inbound control

    const css = (el: HTMLElement, s: Partial<CSSStyleDeclaration>) =>
      Object.assign(el.style, s);

    // A fixed, click-through overlay layer for the hover outline + pins + hint.
    const layer = document.createElement("div");
    css(layer, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      pointerEvents: "none",
      zIndex: "2147483646",
    });
    const outline = document.createElement("div");
    css(outline, {
      position: "fixed",
      border: "2px solid #7c5cff",
      background: "rgba(124,92,255,0.12)",
      borderRadius: "3px",
      pointerEvents: "none",
      display: "none",
      boxSizing: "border-box",
    });
    const pinLayer = document.createElement("div");
    const hint = document.createElement("div");
    hint.textContent = "Review mode — click any element to comment · Esc to exit";
    css(hint, {
      position: "fixed",
      top: "8px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#7c5cff",
      color: "#fff",
      font: "600 12px system-ui, sans-serif",
      padding: "5px 12px",
      borderRadius: "999px",
      pointerEvents: "none",
      display: "none",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    });
    layer.appendChild(outline);
    layer.appendChild(pinLayer);
    layer.appendChild(hint);
    document.documentElement.appendChild(layer);

    let active = false;
    let hovered: Element | null = null;
    let pins: { selector: string; n: number }[] = [];

    // A reasonably stable CSS selector: a unique #id if available, else an
    // :nth-of-type DOM path (capped depth) up to a unique ancestor / html.
    const uniqueId = (id: string): boolean => {
      try {
        return document.querySelectorAll("#" + CSS.escape(id)).length === 1;
      } catch {
        return false;
      }
    };
    // Resolves-to-exactly-`start` check for a candidate selector.
    const resolvesTo = (sel: string, target: Element): boolean => {
      try {
        const m = document.querySelectorAll(sel);
        return m.length === 1 && m[0] === target;
      } catch {
        return false;
      }
    };
    const cssPath = (start: Element): string => {
      if (start.id && uniqueId(start.id)) return "#" + CSS.escape(start.id);
      const parts: string[] = [];
      let node: Element | null = start;
      let depth = 0;
      while (
        node &&
        node.nodeType === 1 &&
        node.tagName.toLowerCase() !== "html" &&
        depth < 20
      ) {
        const cur: Element = node;
        if (cur.id && uniqueId(cur.id)) {
          parts.unshift("#" + CSS.escape(cur.id));
          break;
        }
        let sel = cur.tagName.toLowerCase();
        const parent: Element | null = cur.parentElement;
        if (parent) {
          const sameTag: Element[] = Array.from(parent.children).filter(
            (c: Element) => c.tagName === cur.tagName
          );
          if (sameTag.length > 1)
            sel += ":nth-of-type(" + (sameTag.indexOf(cur) + 1) + ")";
        }
        parts.unshift(sel);
        // Stop as soon as the accumulated path uniquely resolves to `start` — so
        // the selector we hand back (used by querySelector for pins + the agent)
        // can never match a different, earlier document-order element.
        if (resolvesTo(parts.join(" > "), start)) break;
        node = cur.parentElement;
        depth++;
      }
      return parts.join(" > ");
    };
    const describe = (el: Element): string => {
      const tag = el.tagName.toLowerCase();
      const txt = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
      return "<" + tag + (el.id ? "#" + el.id : "") + ">" + (txt ? ' "' + txt + '"' : "");
    };

    const place = (el: HTMLElement, r: DOMRect) =>
      css(el, {
        left: r.left + "px",
        top: r.top + "px",
        width: r.width + "px",
        height: r.height + "px",
      });
    const positionOutline = () => {
      if (!active || !hovered) {
        outline.style.display = "none";
        return;
      }
      outline.style.display = "block";
      place(outline, hovered.getBoundingClientRect());
    };
    const drawPins = () => {
      pinLayer.replaceChildren();
      for (const p of pins) {
        let el: Element | null = null;
        try {
          el = document.querySelector(p.selector);
        } catch {
          el = null;
        }
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const badge = document.createElement("div");
        badge.textContent = String(p.n);
        css(badge, {
          position: "fixed",
          left: r.left - 10 + "px",
          top: r.top - 10 + "px",
          minWidth: "20px",
          height: "20px",
          padding: "0 5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7c5cff",
          color: "#fff",
          font: "700 11px system-ui, sans-serif",
          borderRadius: "10px",
          pointerEvents: "none",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        });
        pinLayer.appendChild(badge);
      }
    };

    const targetAt = (x: number, y: number): Element | null => {
      const el = document.elementFromPoint(x, y);
      // Our overlay is pointer-events:none so elementFromPoint returns the app
      // element beneath, but guard anyway.
      return el && !layer.contains(el) ? el : null;
    };
    const onMove = (e: MouseEvent) => {
      if (!active) return;
      hovered = targetAt(e.clientX, e.clientY);
      positionOutline();
    };
    const onClick = (e: MouseEvent) => {
      if (!active) return;
      const el = targetAt(e.clientX, e.clientY);
      if (!el) return;
      // Block the app's own handlers so review clicks never trigger navigation.
      e.preventDefault();
      e.stopPropagation();
      const r = el.getBoundingClientRect();
      try {
        window.parent.postMessage(
          {
            source: "aiide-preview",
            type: "review-click",
            selector: cssPath(el),
            label: describe(el),
            rect: { x: r.left, y: r.top, width: r.width, height: r.height },
          },
          parentOrigin
        );
      } catch {
        /* parent gone */
      }
    };
    // Swallow the primary PRESS so apps that act on pointerdown/mousedown (drag
    // handles, pointer-based menus, Radix triggers) don't fire during picking.
    // Touch pointers are left alone so the user can still scroll to reach
    // elements — the selector is still captured on the subsequent click.
    const onPress = (e: Event) => {
      if (!active) return;
      if (
        e.type === "pointerdown" &&
        (e as PointerEvent).pointerType === "touch"
      )
        return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onKey = (e: KeyboardEvent) => {
      if (active && e.key === "Escape") {
        disable();
        try {
          window.parent.postMessage(
            { source: "aiide-preview", type: "review-exit" },
            parentOrigin
          );
        } catch {
          /* parent gone */
        }
      }
    };
    const onScrollResize = () => {
      if (active) positionOutline();
      if (pins.length) drawPins();
    };

    const enable = () => {
      if (active) return;
      active = true;
      hint.style.display = "block";
      document.body.style.cursor = "crosshair";
      document.addEventListener("mousemove", onMove, true);
      document.addEventListener("pointerdown", onPress, true);
      document.addEventListener("mousedown", onPress, true);
      document.addEventListener("click", onClick, true);
      document.addEventListener("keydown", onKey, true);
    };
    function disable() {
      active = false;
      hovered = null;
      hint.style.display = "none";
      outline.style.display = "none";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("pointerdown", onPress, true);
      document.removeEventListener("mousedown", onPress, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    }

    const onParentMessage = (ev: MessageEvent) => {
      if (ev.origin !== parentOrigin) return;
      const d = ev.data as
        | { source?: string; type?: string; enabled?: boolean; pins?: unknown }
        | null;
      if (!d || d.source !== "aiide-review") return;
      if (d.type === "set-mode") {
        if (d.enabled) enable();
        else disable();
      } else if (d.type === "set-pins" && Array.isArray(d.pins)) {
        pins = (d.pins as { selector?: unknown; n?: unknown }[])
          .filter((p) => p && typeof p.selector === "string")
          .map((p) => ({ selector: p.selector as string, n: Number(p.n) || 0 }));
        drawPins();
      }
    };

    window.addEventListener("message", onParentMessage);
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    // Tell the IDE we're ready so it can (re)send the current mode + pins even if
    // review was toggled on before this bridge mounted, or after an iframe reload.
    try {
      window.parent.postMessage(
        { source: "aiide-preview", type: "review-ready" },
        parentOrigin
      );
    } catch {
      /* parent gone */
    }

    return () => {
      disable();
      window.removeEventListener("message", onParentMessage);
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      layer.remove();
    };
  }, []);

  return null;
}
