"use client";

import { getZone } from "@/lib/scroll";
import { ISLANDS } from "../islandLayout";
import { IslandStop } from "./IslandStop";
import { useZoneWindow } from "./useZoneWindow";

/** One floating island per project, spaced through the zone, alternating sides. */
export function IslandsZone() {
  const zone = getZone("islands");
  // Visible from well above (they "rise up from below"), hidden once far behind us.
  const { ref } = useZoneWindow(zone.start - 0.2, zone.end + 0.05);

  return (
    <group ref={ref}>
      {ISLANDS.map(({ project, position }, i) => (
        <IslandStop key={project.slug} project={project} position={position} phase={i * 1.3} />
      ))}
    </group>
  );
}
