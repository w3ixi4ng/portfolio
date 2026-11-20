import { useAppStore } from "@/lib/store";
import { walk, type WalkTarget } from "@/lib/walk";
import { HANGARS, KOPI_FACE_YAW, KOPI_STAND, PLAZA, doorPoint } from "./hangarLayout";

/** Have a kopi for a few seconds (the avatar's drink pose + a cup in hand). */
export function startDrinking(ms = 3600) {
  const store = useAppStore.getState();
  store.setDrinking(true);
  window.setTimeout(() => {
    useAppStore.getState().setDrinking(false);
    // Head back out to the plaza in the same breath, so no bubble flickers in between.
    if (walk.has && !walk.queue.length) walk.queue = [[PLAZA[0], PLAZA[1]]];
  }, ms);
}

/**
 * Click a hangar (3D, sign or keyboard button) or the kopi stall: the avatar walks there via
 * the plaza; a hangar's panel opens on arrival, the kopi stall gets a drink. Before landing,
 * or with reduced motion, it just happens.
 */
export function requestWalk(target: WalkTarget) {
  const store = useAppStore.getState();
  const hangar = HANGARS.find((h) => h.section === target);
  const stop: [number, number] | null =
    target === "kopi" ? KOPI_STAND : hangar ? doorPoint(hangar) : null;
  if (!stop) return;

  const arrive = () => {
    if (target === "kopi") startDrinking();
    else store.openPanel({ kind: "hub", section: target });
  };

  if (store.reducedMotion || !walk.has) {
    arrive();
    return;
  }
  if (Math.hypot(walk.x - stop[0], walk.z - stop[1]) < 0.4) {
    arrive();
    return;
  }
  const queue: [number, number][] = [];
  // Always route through the plaza so we never cut across another hangar.
  if (Math.hypot(walk.x - PLAZA[0], walk.z - PLAZA[1]) > 2.2) queue.push([PLAZA[0], PLAZA[1]]);
  queue.push(stop);
  walk.queue = queue;
  walk.section = target;
  walk.face = target === "kopi" ? KOPI_FACE_YAW : null;
}
