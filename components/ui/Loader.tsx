"use client";

import { useAppStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Cute loader (CLAUDE.md §9): a tiny jumper packing a parachute while the 3D assets load.
 * Fades out once everything is in; never blocks the plain HTML underneath for long.
 */
export function Loader() {
  const { active, progress, total } = useAppStore((s) => s.load);
  const [done, setDone] = useState(false);
  // Client-only: without JS (or before hydration) the plain page must never be covered.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (active || total === 0 || progress < 100) return;
    const t = window.setTimeout(() => setDone(true), 350);
    return () => window.clearTimeout(t);
  }, [active, progress, total]);

  // Nothing to load after a while (e.g. the 3D bundle failed): get out of the way.
  useEffect(() => {
    if (total > 0) return;
    const t = window.setTimeout(() => setDone(true), 6000);
    return () => window.clearTimeout(t);
  }, [total]);

  // Safety net: never trap visitors behind the loader.
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 12000);
    return () => window.clearTimeout(t);
  }, []);

  const pct = Math.round(progress);

  return (
    <AnimatePresence>
      {mounted && !done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-sky-top to-sky-bottom"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card w-72 p-6 text-center" role="status" aria-live="polite">
            <svg viewBox="0 0 160 110" className="mx-auto h-28 w-40" aria-hidden="true">
              {/* packing mat */}
              <rect x="10" y="88" width="140" height="10" rx="5" fill="var(--canopy-yellow)" />
              {/* canopy being folded: a bundle that squashes as it's packed */}
              <g className="loader-pack" style={{ transformOrigin: "108px 86px" }}>
                <path d="M78 86 q30 -40 60 0 z" fill="var(--canopy-red)" />
                <path d="M88 86 q20 -26 40 0 z" fill="var(--canopy-yellow)" />
                <path d="M98 86 q10 -13 20 0 z" fill="var(--canopy-teal)" />
              </g>
              {/* little jumper: helmet, face, body, arms pressing the bundle */}
              <g className="loader-bob">
                <rect x="34" y="58" width="26" height="28" rx="12" fill="var(--canopy-teal)" />
                <circle cx="47" cy="44" r="17" fill="#e8be96" />
                <path d="M30 42 a17 17 0 0 1 34 0 z" fill="var(--canopy-red)" />
                <circle cx="42" cy="47" r="2" fill="var(--ink)" />
                <circle cx="52" cy="47" r="2" fill="var(--ink)" />
                <rect x="58" y="64" width="22" height="7" rx="3.5" fill="var(--canopy-teal)" />
              </g>
            </svg>
            <p className="mt-2 font-display text-lg font-bold">Packing your parachute…</p>
            <div className="card-inset mt-3 h-3 overflow-hidden" aria-hidden="true">
              <div
                className="h-full rounded-full bg-canopy-red transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-bold text-ink-soft">{pct}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
