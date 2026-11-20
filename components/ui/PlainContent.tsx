import { education, experience, isTodo, profile, projects, settings, skills } from "@/content";
import { CREDITS } from "@/lib/credits";

/**
 * The whole portfolio as plain semantic HTML (CLAUDE.md §8). Used by /plain and as the
 * automatic fallback when WebGL isn't available. Reads only from content/.
 */
export function PlainContent({ backLink }: { backLink?: React.ReactNode }) {
  const { linkedin, github } = profile.links;

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <header>
        {backLink}
        <h1 className="mt-4 font-display text-4xl font-bold">{profile.name}</h1>
        <p className="mt-1 font-display text-lg font-semibold text-teal-ink">{profile.title}</p>
        <p className="mt-3">{profile.pitch}</p>
        <nav aria-label="Sections" className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          {[
            ["about", "About"],
            ["skills", "Skills"],
            ["projects", "Projects"],
            ["experience", "Experience"],
            ["contact", "Contact"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="chip hover:bg-cream">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section aria-labelledby="about">
        <h2 id="about" className="font-display text-2xl font-bold">
          About
        </h2>
        {!isTodo(profile.bio) && <p className="mt-2">{profile.bio}</p>}
        {profile.location && <p className="mt-2">Based in {profile.location}.</p>}
        {education.map((e) => (
          <div key={`${e.school}-${e.start}`} className="mt-4">
            <h3 className="font-bold">{e.school}</h3>
            <p>
              {e.degree} · {e.start} – {e.end}
            </p>
            <ul className="mt-1 list-disc pl-5">
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="skills">
        <h2 id="skills" className="font-display text-2xl font-bold">
          Skills
        </h2>
        <dl className="mt-2 space-y-2">
          {skills.map((g) => (
            <div key={g.group}>
              <dt className="font-bold">{g.group}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="projects">
        <h2 id="projects" className="font-display text-2xl font-bold">
          Projects
        </h2>
        {projects.map((p) => (
          <article key={p.slug} className="mt-4">
            <h3 className="font-display text-xl font-semibold">{p.title}</h3>
            <p className="text-sm text-ink-soft">
              {[p.badge, p.role, p.period ?? String(p.year)].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1">{p.description}</p>
            <ul className="mt-1 list-disc pl-5">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="mt-1 text-sm">Stack: {p.stack.join(", ")}</p>
            {(["live", "repo", "caseStudy"] as const).some((k) => !isTodo(p.links[k])) && (
              <p className="mt-1 flex gap-3 text-sm">
                {!isTodo(p.links.live) && (
                  <a className="text-teal-ink underline" href={p.links.live}>
                    Live demo
                  </a>
                )}
                {!isTodo(p.links.repo) && (
                  <a className="text-teal-ink underline" href={p.links.repo}>
                    Source
                  </a>
                )}
                {!isTodo(p.links.caseStudy) && (
                  <a className="text-teal-ink underline" href={p.links.caseStudy}>
                    Case study
                  </a>
                )}
              </p>
            )}
          </article>
        ))}
      </section>

      <section aria-labelledby="experience">
        <h2 id="experience" className="font-display text-2xl font-bold">
          Experience
        </h2>
        {experience.map((e) => (
          <article key={`${e.company}-${e.start}`} className="mt-4">
            <h3 className="font-display text-xl font-semibold">
              {e.role} · {e.company}
              {e.team ? ` (${e.team})` : ""}
            </h3>
            <p className="text-sm text-ink-soft">
              {e.start} – {e.end}
            </p>
            <ul className="mt-1 list-disc pl-5">
              {e.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="contact">
        <h2 id="contact" className="font-display text-2xl font-bold">
          Contact
        </h2>
        <ul className="mt-2 space-y-1">
          <li>
            Email:{" "}
            <a className="text-teal-ink underline" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          {!isTodo(linkedin) && (
            <li>
              <a className="text-teal-ink underline" href={linkedin}>
                LinkedIn
              </a>
            </li>
          )}
          {!isTodo(github) && (
            <li>
              <a className="text-teal-ink underline" href={github}>
                GitHub
              </a>
            </li>
          )}
          {settings.showResumeDownload && !isTodo(profile.resume) && (
            <li>
              <a className="text-teal-ink underline" href={profile.resume} download>
                Download résumé (PDF)
              </a>
            </li>
          )}
        </ul>
      </section>

      <footer
        id="credits"
        className="border-t-2 border-dashed border-border pt-6 text-sm text-ink-soft"
      >
        <h2 className="font-display text-base font-bold text-ink">3D model credits</h2>
        <ul className="mt-2 space-y-1">
          {CREDITS.map((c) => (
            <li key={c.work}>
              “{c.work}” by {c.author} ({c.licence}) ·{" "}
              <a className="text-teal-ink underline" href={c.url}>
                source
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
