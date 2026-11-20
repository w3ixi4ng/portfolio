"use client";

import { projects } from "@/content";
import { useAppStore } from "@/lib/store";

/** HTML equivalent of the sky islands. */
export function ProjectsCard() {
  const openPanel = useAppStore((s) => s.openPanel);
  return (
    <>
      <ul className="space-y-2.5">
        {projects.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              onClick={() => openPanel({ kind: "project", slug: p.slug })}
              className="card-inset tap-card w-full p-3 text-left"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display font-bold">{p.title}</span>
                {p.featured && <span className="text-xs font-bold text-teal-ink">★ featured</span>}
              </span>
              {p.badge && <span className="block text-xs font-bold text-ink-soft">{p.badge}</span>}
              <span className="mt-1 block text-sm">{p.tagline}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
