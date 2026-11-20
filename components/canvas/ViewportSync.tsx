"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/**
 * Keeps the renderer exactly the size of the viewport. R3F measures its container with a
 * ResizeObserver; if a resize is missed (seen right after load), the canvas stays smaller
 * than the window and the page background shows as a strip at the right/bottom.
 */
export function ViewportSync() {
  const setSize = useThree((s) => s.setSize);

  useEffect(() => {
    const sync = () => setSize(window.innerWidth, window.innerHeight);
    sync();
    // Run again after layout settles (fonts, scrollbar appearing).
    const t1 = window.setTimeout(sync, 250);
    const t2 = window.setTimeout(sync, 1200);
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, [setSize]);

  return null;
}
