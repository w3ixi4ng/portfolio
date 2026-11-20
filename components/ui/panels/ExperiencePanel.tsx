"use client";

import { experience } from "@/content";
import { useAppStore } from "@/lib/store";

/** One canopy-flight waypoint (a role), with prev/next along the flight path. */
export function ExperiencePanel({ index }: { index: number }) {
  const openPanel = useAppStore((s) => s.openPanel);
  const e = experience[index];
  if (!e) return null;

  return (
    <div className="space-y-3">
      <p className="font-display text-lg font-semibold">
        {e.role}
        {e.team ? <span className="text-ink-soft"> · {e.team}</span> : null}
      </p>
      <p className="text-sm font-bold text-ink-soft">
        {e.start} – {e.end}
      </p>
      {e.summary && <p>{e.summary}</p>}
      {e.bullets.length > 0 && (
        <ul className="list-disc space-y-1.5 pl-5">
          {e.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      <div className="flex justify-between gap-2 border-t-2 border-dashed border-border pt-3">
        <button
          type="button"
          className="btn btn-sm btn-cream"
          disabled={index === 0}
          onClick={() => openPanel({ kind: "experience", index: index - 1 })}
        >
          ← Newer
        </button>
        <button
          type="button"
          className="btn btn-sm btn-cream"
          disabled={index === experience.length - 1}
          onClick={() => openPanel({ kind: "experience", index: index + 1 })}
        >
          Older →
        </button>
      </div>
    </div>
  );
}
