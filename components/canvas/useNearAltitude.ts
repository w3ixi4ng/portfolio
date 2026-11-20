"use client";

import { useEffect, useState } from "react";
import { Vector3 } from "three";
import { onScrollFrame } from "@/lib/scrollState";
import { getAvatarPosition } from "./path";

/**
 * True while the avatar is within [below, above] world units of `y` (labels for things
 * you're passing). Re-renders only when the answer flips, never per frame.
 */
export function useNearAltitude(y: number, below = 6, above = 14): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const pos = new Vector3();
    let last: boolean | null = null;
    return onScrollFrame((t) => {
      const dy = getAvatarPosition(t, pos).y - y;
      const next = dy > -below && dy < above;
      if (next !== last) {
        last = next;
        setNear(next);
      }
    });
  }, [y, below, above]);

  return near;
}
