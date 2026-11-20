"use client";

import { AnimatePresence, motion } from "framer-motion";
import { EGGS, useAppStore } from "@/lib/store";

/** "🪂 3/8 found": appears once the first easter egg is found (CLAUDE.md §5). */
export function EggCounter() {
  const found = useAppStore((s) => s.eggsFound.length);
  const reduce = useAppStore((s) => s.reducedMotion);
  return (
    <AnimatePresence>
      {found > 0 && (
        <motion.p
          key="eggs"
          role="status"
          aria-live="polite"
          className="pill pointer-events-auto absolute top-[4.25rem] right-3 px-3 py-1 text-sm font-bold sm:top-[4.75rem] sm:right-5"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 20 }}
        >
          🪂 {found}/{EGGS.length} found
        </motion.p>
      )}
    </AnimatePresence>
  );
}
