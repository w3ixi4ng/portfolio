"use client";

import { useFrame } from "@react-three/fiber";
import { easeDaylight, snapDaylight } from "@/lib/daylight";
import { scrollState } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";

/** Eases the live `daylight` state toward the chosen time of day (runs before everything that reads it). */
export function DaylightDriver() {
  useFrame((_, delta) => {
    const tod = useAppStore.getState().tod;
    if (scrollState.reducedMotion) snapDaylight(tod);
    else easeDaylight(tod, 1 - Math.exp(-delta / 0.6));
  }, -10);
  return null;
}
