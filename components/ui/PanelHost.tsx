"use client";

import { experience, profile, projects, skills } from "@/content";
import { useAppStore, type PanelRef } from "@/lib/store";
import { Panel } from "./Panel";
import { ExperienceCard } from "./cards/ExperienceCard";
import { ProjectsCard } from "./cards/ProjectsCard";
import { SkillsCard } from "./cards/SkillsCard";
import { ProjectCard } from "./ProjectCard";
import { AboutPanel } from "./panels/AboutPanel";
import { ContactPanel } from "./panels/ContactPanel";
import { ExperiencePanel } from "./panels/ExperiencePanel";
import { SkillsPanel } from "./panels/SkillsPanel";

function resolve(panel: PanelRef | null): { title: string; body: React.ReactNode } | null {
  if (!panel) return null;
  switch (panel.kind) {
    case "about":
      return { title: profile.name, body: <AboutPanel /> };
    case "skills": {
      const g = skills[panel.index];
      return g ? { title: g.group, body: <SkillsPanel index={panel.index} /> } : null;
    }
    case "project": {
      const p = projects.find((x) => x.slug === panel.slug);
      return p ? { title: p.title, body: <ProjectCard project={p} /> } : null;
    }
    case "experience": {
      const e = experience[panel.index];
      return e ? { title: e.company, body: <ExperiencePanel index={panel.index} /> } : null;
    }
    case "contact":
      return { title: "Get in touch", body: <ContactPanel /> };
    case "hub":
      return panel.section === "projects"
        ? { title: "Projects", body: <ProjectsCard /> }
        : panel.section === "experience"
          ? { title: "Experience", body: <ExperienceCard /> }
          : { title: "Skills", body: <SkillsCard /> };
  }
}

/** The one detail panel, opened from in-world signs, bubbles and the HUD. */
export function PanelHost() {
  const panel = useAppStore((s) => s.panel);
  const close = useAppStore((s) => s.closePanel);
  const backTo = useAppStore((s) => s.backTo);
  const openPanel = useAppStore((s) => s.openPanel);
  const resolved = resolve(panel);

  return (
    <Panel
      open={!!resolved}
      onClose={close}
      onBack={backTo ? () => openPanel(backTo) : undefined}
      title={resolved?.title ?? ""}
    >
      {resolved?.body}
    </Panel>
  );
}
