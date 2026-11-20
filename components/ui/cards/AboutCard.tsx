"use client";

import { education, isTodo, profile } from "@/content";
import { useAppStore } from "@/lib/store";

export function AboutCard() {
  const openPanel = useAppStore((s) => s.openPanel);
  const school = education[0];
  return (
    <div className="space-y-3">
      <p>{isTodo(profile.bio) ? profile.pitch : profile.bio}</p>
      {profile.location && <p className="text-sm font-bold text-ink-soft">📍 {profile.location}</p>}
      {school && (
        <div className="card-inset p-3">
          <p className="text-sm font-bold">{school.school}</p>
          <p className="text-xs text-ink-soft">
            {school.degree} · {school.start} – {school.end}
          </p>
          {school.highlights.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {school.highlights.map((h) => (
                <li key={h} className="chip bg-paper! text-xs">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button type="button" className="btn btn-sm" onClick={() => openPanel({ kind: "about" })}>
        More about me
      </button>
    </div>
  );
}
