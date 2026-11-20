/**
 * Where each project island floats (shared by the islands zone and the avatar's hints).
 * Screen-left / screen-right of the fall column in the top-down view (world ±x).
 */
import { projects } from "@/content";
import { avatarAt, spreadInZone } from "./path";

const DISTANCE = 6.5;

export const ISLANDS = projects.map((project, i) => {
  const at = avatarAt(spreadInZone("islands", projects.length, i, 0.08));
  const side = i % 2 === 0 ? -1 : 1;
  return {
    project,
    side: side as -1 | 1,
    position: [side * DISTANCE, at.y - 1.6, 0] as [number, number, number],
  };
});
