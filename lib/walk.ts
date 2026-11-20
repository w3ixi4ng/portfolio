/**
 * Click-to-walk at the dropzone: the avatar walks to a hangar door, then its panel opens.
 * Mutable module state (read every frame by the avatar), no React renders.
 */
import type { HubSection } from "./store";

export type WalkTarget = HubSection | "kopi";

export const WALK_SPEED = 3.6;

export const walk = {
  /** True once the avatar has landed and is under click-to-walk control. */
  has: false,
  x: 0,
  z: 0,
  /** Facing while walking (radians about +y; 0 faces +z). */
  yaw: 0,
  /** Waypoints still to visit, in order. */
  queue: [] as [number, number][],
  /** What to do on arrival: open that hangar's panel, or have a kopi. */
  section: null as WalkTarget | null,
  /** Yaw to face on arrival (null: keep the walking direction). */
  face: null as number | null,
};
