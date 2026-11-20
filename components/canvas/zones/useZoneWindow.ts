"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";

/**
 * Hides a zone's group outside a scroll window so its meshes skip rendering, and
 * reports whether it's active so per-frame work can bail early (CLAUDE.md §9).
 */
export function useZoneWindow(from: number, to: number) {
  const ref = useRef<Group>(null);
  const active = useRef(false);

  // Negative priority: runs before the zone's own useFrame callbacks.
  useFrame(() => {
    const t = scrollState.current;
    active.current = t >= from && t <= to;
    if (ref.current) ref.current.visible = active.current;
  }, -1);

  return { ref, active };
}
