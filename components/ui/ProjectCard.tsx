import Image from "next/image";
import { isTodo, type Project } from "@/content";

const LINK_LABELS: Record<keyof Project["links"], string> = {
  live: "Live demo",
  repo: "Source code",
  caseStudy: "Case study",
};

/** Full project details, shown inside a Panel. */
export function ProjectCard({ project }: { project: Project }) {
  const links = (Object.keys(LINK_LABELS) as (keyof Project["links"])[]).filter(
    (k) => !isTodo(project.links[k]),
  );

  return (
    <article className="space-y-4">
      {project.badge && <p className="chip bg-canopy-yellow/40">🏆 {project.badge}</p>}
      <p className="text-lg font-semibold">{project.tagline}</p>

      {!isTodo(project.thumbnail) && (
        <div className="relative aspect-video overflow-hidden rounded-xl border-4 border-border">
          <Image
            src={project.thumbnail}
            alt=""
            fill
            sizes="(min-width: 640px) 36rem, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <p>{project.description}</p>

      {project.highlights.length > 0 && (
        <ul className="list-disc space-y-1 pl-5">
          {project.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="font-bold">Role</dt>
        <dd>{project.role}</dd>
        <dt className="font-bold">When</dt>
        <dd>{project.period ?? project.year}</dd>
      </dl>

      <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
        {project.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {links.map((k) => (
            <a
              key={k}
              href={project.links[k]}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
            >
              {LINK_LABELS[k]} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
