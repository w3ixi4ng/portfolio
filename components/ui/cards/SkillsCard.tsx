"use client";

import { skills } from "@/content";
import { useAppStore } from "@/lib/store";
import { SkillIcon } from "../SkillIcon";

/** HTML equivalent of the formation: every skill group, each opening its panel. */
export function SkillsCard() {
  const openPanel = useAppStore((s) => s.openPanel);
  return (
    <ul className="space-y-2.5">
      {skills.map((g, i) => (
        <li key={g.group}>
          <button
            type="button"
            onClick={() => openPanel({ kind: "skills", index: i })}
            className="card-inset w-full p-3 text-left transition-transform active:scale-[0.98]"
          >
            <span className="font-display font-bold">{g.group}</span>
            <span className="mt-2 flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span key={item} className="chip gap-1.5 bg-paper! py-0.5 pr-2.5 pl-1 text-xs">
                  <SkillIcon name={item} size={20} />
                  {item}
                </span>
              ))}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
