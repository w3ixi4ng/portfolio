"use client";

import { useEffect } from "react";
import { sfx } from "@/lib/sound";

/** Soft click on any button/link press (CLAUDE.md §3), only when sound is switched on. */
export function ClickSounds() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("button, a")) sfx.click();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
