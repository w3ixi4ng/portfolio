"use client";

import { useProgress } from "@react-three/drei";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/** Reports drei's asset loading progress to the store, for the HTML loader. */
export function ProgressBridge() {
  const { active, progress, total } = useProgress();
  const setLoad = useAppStore((s) => s.setLoad);
  useEffect(() => {
    setLoad({ active, progress, total });
  }, [active, progress, total, setLoad]);
  return null;
}
