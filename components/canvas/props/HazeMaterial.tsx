"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, type MeshStandardMaterial } from "three";
import { daylight } from "@/lib/daylight";

/**
 * Far-away surface: scene fog doesn't reach this far, so it blends toward the current horizon
 * colour itself (aerial perspective): distant trees and towers go pale and warm in the haze,
 * not stay saturated green. By night the horizon is violet, so they sink into it too.
 */
export function HazeMaterial({ color, amount = 0.62 }: { color: string; amount?: number }) {
  const mat = useRef<MeshStandardMaterial>(null);
  const base = useRef(new Color(color));
  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    m.color.copy(base.current).lerp(daylight.horizon, amount);
    m.emissive.copy(m.color);
    m.emissiveIntensity = 0.3 * (1 - daylight.night);
  });
  return <meshStandardMaterial ref={mat} color={color} roughness={0.85} fog={false} />;
}
