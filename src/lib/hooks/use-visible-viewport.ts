"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";

const SENTINEL_SPACING = 50;

interface ViewportInfo {
  top: number;
  bottom: number;
  centerY: number;
}

/**
 * Tracks which part of the iframe is visible to the user by placing tiny sentinel
 * elements along the page and using IntersectionObserver with root: null (top-level
 * viewport). Works cross-origin because IO computes against the browser viewport
 * even from within iframes. Falls back gracefully when not embedded.
 */
export function useVisibleViewport(): ViewportInfo | null {
  const [viewport, setViewport] = useState<ViewportInfo | null>(null);
  const visibleSetRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isEmbedded = window.self !== window.top;
    if (!isEmbedded) return;

    const pageHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      600
    );
    const numSentinels = Math.min(Math.ceil(pageHeight / SENTINEL_SPACING), 200);

    const sentinels: HTMLDivElement[] = [];
    for (let i = 0; i < numSentinels; i++) {
      const el = document.createElement("div");
      el.style.cssText = `position:absolute;top:${i * SENTINEL_SPACING}px;left:0;width:1px;height:1px;pointer-events:none;`;
      el.setAttribute("aria-hidden", "true");
      el.dataset.vIdx = String(i);
      document.body.appendChild(el);
      sentinels.push(el);
    }

    const recalc = () => {
      const visible = visibleSetRef.current;
      if (visible.size === 0) return;

      let minIdx = Infinity;
      let maxIdx = -Infinity;
      for (const idx of visible) {
        if (idx < minIdx) minIdx = idx;
        if (idx > maxIdx) maxIdx = idx;
      }

      const top = minIdx * SENTINEL_SPACING;
      const bottom = (maxIdx + 1) * SENTINEL_SPACING;
      setViewport({ top, bottom, centerY: (top + bottom) / 2 });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLDivElement).dataset.vIdx);
          if (entry.isIntersecting) {
            visibleSetRef.current.add(idx);
          } else {
            visibleSetRef.current.delete(idx);
          }
        }
        recalc();
      },
      { root: null, threshold: [0] }
    );

    for (const s of sentinels) observer.observe(s);

    return () => {
      observer.disconnect();
      for (const s of sentinels) s.remove();
      visibleSetRef.current.clear();
    };
  }, []);

  return viewport;
}

const ViewportContext = createContext<ViewportInfo | null>(null);

export const ViewportProvider = ViewportContext.Provider;

export function useViewportCenter(): number | null {
  const vp = useContext(ViewportContext);
  return vp?.centerY ?? null;
}
