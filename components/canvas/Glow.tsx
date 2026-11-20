"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { daylight } from "@/lib/daylight";

interface GlowProps {
  color: string;
  emissive: string;
  /** Emissive strength by day / by night. */
  off?: number;
  on?: number;
}

/** A material that lights up as night falls (lamp bulbs, windows). */
export function Glow({ color, emissive, off = 0.08, on = 2.4 }: GlowProps) {
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.emissiveIntensity = off + (on - off) * daylight.night;
  });
  return (
    <meshStandardMaterial
      ref={mat}
      color={color}
      emissive={emissive}
      emissiveIntensity={off}
      roughness={0.4}
    />
  );
}
