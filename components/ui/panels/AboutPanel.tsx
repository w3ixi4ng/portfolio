import { education, isTodo, profile } from "@/content";

export function AboutPanel() {
  return (
    <div className="space-y-4">
      <p className="font-display text-lg font-semibold text-teal-ink">{profile.title}</p>
      {!isTodo(profile.bio) ? <p>{profile.bio}</p> : <p>{profile.pitch}</p>}
      {profile.location && (
        <p className="text-sm font-bold text-ink-soft">📍 Based in {profile.location}</p>
      )}

      <h3 className="font-display text-lg font-bold">Education</h3>
      <ul className="space-y-3">
        {education.map((e) => (
          <li key={`${e.school}-${e.start}`}>
            <p className="font-bold">{e.school}</p>
            <p className="text-sm">
              {e.degree} · {e.start} – {e.end}
            </p>
            {e.highlights.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2">
                {e.highlights.map((h) => (
                  <li key={h} className="chip">
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
