"use client";

import { profile } from "@/content";
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
  // The plane climbs to jump altitude as things load.
  const feet = Math.round((pct / 100) * 130) * 100;
  const status =
    pct < 30
      ? "Packing the canopy…"
      : pct < 60
        ? "Checking the altimeter…"
        : pct < 92
          ? "Climbing to altitude…"
          : "Door's open!";

  return (
    <AnimatePresence>
      {mounted && !done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-40 overflow-hidden bg-gradient-to-b from-sky-top to-sky-bottom"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* drifting clouds */}
          {[
            { top: "8%", size: 150, dur: 38, delay: -6 },
            { top: "22%", size: 100, dur: 30, delay: -20 },
            { top: "76%", size: 190, dur: 46, delay: -12 },
            { top: "88%", size: 120, dur: 34, delay: -28 },
          ].map((c) => (
            <svg
              key={c.top}
              viewBox="0 0 120 50"
              className="loader-cloud absolute"
              style={{
                top: c.top,
                width: c.size,
                animationDuration: `${c.dur}s`,
                animationDelay: `${c.delay}s`,
              }}
              aria-hidden="true"
            >
              <g fill="var(--cloud)">
                <circle cx="35" cy="32" r="18" />
                <circle cx="60" cy="24" r="22" />
                <circle cx="86" cy="32" r="16" />
                <rect x="20" y="30" width="82" height="18" rx="9" />
              </g>
            </svg>
          ))}

          <div
            className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
            role="status"
            aria-live="polite"
          >
            {/* a little jumper under canopy, swaying */}
            <svg viewBox="0 0 160 150" className="loader-sway h-40 w-44" aria-hidden="true">
              <g strokeLinecap="round">
                {/* canopy: one arched wing, striped in our canopy colours */}
                <defs>
                  <clipPath id="loader-canopy">
                    <path d="M18 46 Q80 0 142 46 L134 56 Q80 18 26 56 Z" />
                  </clipPath>
                </defs>
                <g clipPath="url(#loader-canopy)">
                  {[
                    "var(--canopy-red)",
                    "var(--canopy-yellow)",
                    "var(--canopy-teal)",
                    "var(--canopy-yellow)",
                    "var(--canopy-red)",
                  ].map((c, i) => (
                    <rect key={i} x={18 + i * 24.8} y="0" width="25" height="60" fill={c} />
                  ))}
                </g>
                {/* lines */}
                {[28, 54, 106, 132].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1={x < 80 ? 52 - (x - 28) * 0.2 : 52 - (132 - x) * 0.2}
                    x2={80}
                    y2={98}
                    stroke="var(--ink)"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                  />
                ))}
                {/* jumper: rig, body, helmet, face, mitten hands */}
                <rect x="70" y="96" width="20" height="24" rx="9" fill="var(--canopy-teal)" />
                <rect x="64" y="100" width="7" height="12" rx="3.5" fill="var(--canopy-teal)" />
                <rect x="89" y="100" width="7" height="12" rx="3.5" fill="var(--canopy-teal)" />
                <circle cx="80" cy="88" r="12" fill="#e8be96" />
                <path d="M68 86 a12 12 0 0 1 24 0 z" fill="var(--canopy-red)" />
                <circle cx="76" cy="90" r="1.6" fill="var(--ink)" />
                <circle cx="84" cy="90" r="1.6" fill="var(--ink)" />
                <rect x="72" y="119" width="6" height="10" rx="3" fill="var(--ink)" />
                <rect x="82" y="119" width="6" height="10" rx="3" fill="var(--ink)" />
              </g>
            </svg>

            <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-1 font-display text-lg font-semibold text-ink-soft">{status}</p>

            {/* flight path: the little plane climbs along it as things load */}
            <div className="mt-6 w-full max-w-sm" aria-hidden="true">
              <div className="relative h-8">
                <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-ink/25" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-canopy-red transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
                <svg
                  viewBox="0 0 40 24"
                  className="absolute top-1/2 h-6 w-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-300"
                  style={{ left: `${pct}%` }}
                >
                  {/* drawn nose-left: mirrored so it flies left to right */}
                  <g transform="translate(40 0) scale(-1 1)">
                    <path
                      d="M4 12 q2 -5 10 -5 h14 l7 -5 h3 l-3 8 q3 2 0 4 h-21 q-10 0 -10 -2z"
                      fill="var(--canopy-red)"
                    />
                    <rect x="15" y="9" width="12" height="3" rx="1.5" fill="var(--paper)" />
                    <rect x="12" y="13" width="14" height="3" rx="1.5" fill="var(--cream)" />
                  </g>
                </svg>
              </div>
              <div className="mt-1 flex justify-between text-xs font-bold text-ink-soft">
                <span>Ground</span>
                <span className="tabular-nums">{feet.toLocaleString("en-US")} ft</span>
                <span>Jump run</span>
              </div>
            </div>
            <span className="sr-only">Loading {pct}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
