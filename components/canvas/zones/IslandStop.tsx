"use client";

import type { Project } from "@/content";
import { WorldSign } from "@/components/ui/world/WorldSign";
import { useAppStore } from "@/lib/store";
import { Island } from "../props/Island";
import { WorldHtml } from "../WorldHtml";
import { useNearAltitude } from "../useNearAltitude";

interface IslandStopProps {
  project: Project;
  position: [number, number, number];
  phase: number;
}

/** One project island plus its shop sign, which shows only while you're passing it. */
export function IslandStop({ project, position, phase }: IslandStopProps) {
  const openPanel = useAppStore((s) => s.openPanel);
  const near = useNearAltitude(position[1], 4, 12);
  const open = () => openPanel({ kind: "project", slug: project.slug });

  return (
    <group position={position}>
      <Island theme={project.islandTheme} position={[0, 0, 0]} phase={phase} onSelect={open} />
      <WorldHtml position={[0, 0.6, 0]} visible={near}>
        <WorldSign
          label={project.title}
          sub={project.badge ?? project.period}
          icon={project.featured ? <span aria-hidden="true">★</span> : undefined}
          actionLabel={`Open project: ${project.title}`}
          onClick={open}
        />
      </WorldHtml>
    </group>
  );
}
