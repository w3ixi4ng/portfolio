/**
 * Device capability → quality tier (CLAUDE.md §9). The initial guess is refined at
 * runtime by drei's <PerformanceMonitor> (components/canvas/QualityGovernor.tsx).
 *
 * high   : AO + bloom, 2048 shadows, full dpr
 * medium : cheaper AO, 1024 shadows
 * low    : no post FX, no shadows, dpr capped at 1
 */
export type QualityTier = "high" | "medium" | "low";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export function initialQuality(): QualityTier {
  if (typeof navigator === "undefined") return "medium";
  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 2 || memory <= 2) return "low";
  if (coarse || cores <= 4 || memory <= 4) return "medium";
  return "high";
}

export const stepDown = (q: QualityTier): QualityTier => (q === "high" ? "medium" : "low");
export const stepUp = (q: QualityTier): QualityTier => (q === "low" ? "medium" : "high");
