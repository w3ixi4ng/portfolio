"use client";

import { experience } from "@/content";
import { useAppStore } from "@/lib/store";

/** HTML equivalent of the canopy-flight waypoints, newest first. */
export function ExperienceCard() {
  const openPanel = useAppStore((s) => s.openPanel);
  return (
    <>
      <ol className="space-y-2.5">
        {experience.map((e, i) => (
          <li key={`${e.company}-${e.start}`}>
            <button
              type="button"
              onClick={() => openPanel({ kind: "experience", index: i })}
              className="card-inset tap-card w-full p-3 text-left"
            >
              <span className="font-display font-bold">{e.company}</span>
              <span className="block text-sm">{e.role}</span>
              <span className="block text-xs font-bold text-ink-soft">
                {e.start} – {e.end}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
