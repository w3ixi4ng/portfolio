"use client";

import { useEffect, useState } from "react";

/** Shows a bubble for `ms` after `show()` is called. */
export function useBlip(ms: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(false), ms);
    return () => window.clearTimeout(t);
  }, [on, ms]);
  return [on, () => setOn(true)] as const;
}
