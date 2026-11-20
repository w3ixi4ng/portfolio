"use client";

import { skills } from "@/content";
import { useAppStore } from "@/lib/store";
import { SkillIcon } from "../SkillIcon";

/** One skill group, with tabs to hop to the other jumpers in the formation. */
export function SkillsPanel({ index }: { index: number }) {
  const openPanel = useAppStore((s) => s.openPanel);
  const group = skills[index];
  if (!group) return null;

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2">
        {group.items.map((s) => (
          <li key={s} className="chip gap-2 py-1 pl-1.5">
            <SkillIcon name={s} size={22} />
            {s}
          </li>
        ))}
      </ul>
      {skills.length > 1 && (
        <nav
          aria-label="Other skill groups"
          className="flex flex-wrap gap-2 border-t-2 border-dashed border-border pt-3"
        >
          {skills.map((g, i) =>
            i === index ? null : (
              <button
                key={g.group}
                type="button"
                className="btn btn-sm btn-cream"
                onClick={() => openPanel({ kind: "skills", index: i })}
              >
                {g.group}
              </button>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
