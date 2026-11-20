"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { initialQuality } from "@/lib/quality";
import { useAppStore } from "@/lib/store";

/**
 * Picks the quality tier from the device ONCE at load (while the loader is up). It never
 * changes it afterwards: resizing the render target or toggling passes mid-scroll flashes the
 * screen black, which is worse than a lower frame rate.
 */
export function QualityGovernor() {
  const setQuality = useAppStore((s) => s.setQuality);
  const setDpr = useThree((s) => s.setDpr);

  useEffect(() => {
    const tier = initialQuality();
    setQuality(tier);
    const dpr = window.devicePixelRatio;
    setDpr(tier === "low" ? 1 : tier === "medium" ? Math.min(1.5, dpr) : Math.min(2, dpr));
  }, [setQuality, setDpr]);

  return null;
}
