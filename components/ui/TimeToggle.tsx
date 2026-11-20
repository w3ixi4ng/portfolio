"use client";

import { useEffect, useRef, useState } from "react";
import { TIMES, TIME_LABEL, type TimeOfDay } from "@/lib/daylight";
import { useAppStore } from "@/lib/store";

/** Tiny icon per look. */
function Icon({ tod }: { tod: TimeOfDay }) {
  switch (tod) {
    case "night":
      return (
        <path
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      );
    case "day":
      return (
        <>
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <path
            d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      );
    default:
      // sunrise / golden hour: a half sun on the horizon (arrow up for sunrise, down for golden)
      return (
        <>
          <path d="M6 16a6 6 0 0 1 12 0z" fill="currentColor" />
          <path d="M3 19.5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d={
              tod === "sunrise"
                ? "M12 3.5v4M9.8 5.7 12 3.5l2.2 2.2"
                : "M12 7.5v-4M9.8 5.3 12 7.5l2.2-2.2"
            }
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
  }
}

function Glyph({ tod }: { tod: TimeOfDay }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <Icon tod={tod} />
    </svg>
  );
}

/**
 * Time-of-day dropdown: the button shows the current look; opening it lists sunrise, day,
 * golden hour and night. Starts from the time in Singapore.
 */
export function TimeToggle() {
  const tod = useAppStore((s) => s.tod);
  const setTod = useAppStore((s) => s.setTod);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="btn btn-round btn-cream h-8! w-8!"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Time of day: ${TIME_LABEL[tod]}. Change`}
        title={TIME_LABEL[tod]}
        onClick={() => setOpen((v) => !v)}
      >
        <Glyph tod={tod} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Time of day"
          className="card absolute top-full right-0 z-40 mt-2 w-44 p-1.5"
        >
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              role="menuitemradio"
              aria-checked={t === tod}
              onClick={() => {
                setTod(t);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold transition-colors ${
                t === tod ? "bg-canopy-yellow text-[#2b2a30]" : "hover:bg-[var(--btn)]"
              }`}
            >
              <Glyph tod={t} />
              {TIME_LABEL[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
