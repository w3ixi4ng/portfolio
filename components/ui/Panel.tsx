"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { useAppStore } from "@/lib/store";

interface PanelProps {
  open: boolean;
  onClose: () => void;
  /** Optional "← Back" (e.g. from a project back to the hangar's list). */
  onBack?: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Detail panel: a cream card (design/STYLE.md §9). Centred on desktop, bottom sheet on small screens.
 */
export function Panel({ open, onClose, onBack, title, children }: PanelProps) {
  const reduce = useAppStore((s) => s.reducedMotion);
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        // Minimal focus trap.
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-30 flex items-end justify-center bg-ink/35 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="card w-full rounded-b-none! px-5 pt-5 pb-6 sm:max-w-xl sm:rounded-[20px]! sm:px-7"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, rotate: -2, scale: 0.9 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            transition={
              reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 22 }
            }
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {onBack && (
                  <button
                    type="button"
                    className="btn btn-round btn-cream shrink-0"
                    onClick={onBack}
                    aria-label="Back to the list"
                  >
                    ←
                  </button>
                )}
                <h2 id={titleId} className="font-display text-2xl leading-tight font-bold">
                  {title}
                </h2>
              </div>
              <button type="button" className="btn btn-round" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="-mx-1 max-h-[64vh] overflow-y-auto p-1 sm:max-h-[66vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
