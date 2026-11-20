import type { HubSection } from "@/lib/store";

/** Where I touch down: the plaza every hangar faces. */
export const PLAZA: [number, number] = [0, 1.2];

export interface HangarSpec {
  section: HubSection;
  /** Sign text. */
  label: string;
  sub: string;
  x: number;
  z: number;
  /** Door colour/trim (ribs). */
  trim: string;
  tone: "red" | "navy" | "teal" | "cream";
}

/**
 * Three hangars round the landing plaza, all 10 units from its centre, and 7.3 units from each other (about 43 degrees apart as
 * seen on screen: left, upper-left, upper), so the contact card on the right never covers one.
 */
export const HANGARS: readonly HangarSpec[] = [
  {
    section: "projects",
    label: "Hangar 01",
    sub: "Projects",
    x: 1.05,
    z: -8.74,
    trim: "#D0402C",
    tone: "red",
  },
  {
    section: "experience",
    label: "Hangar 02",
    sub: "Experience",
    x: -6.02,
    z: -6.78,
    trim: "#4E9C8F",
    tone: "teal",
  },
  {
    section: "skills",
    label: "Hangar 03",
    sub: "Skills",
    x: -9.85,
    z: -0.53,
    trim: "#26458C",
    tone: "navy",
  },
];

/** Yaw that makes a hangar's door (local +z) face the plaza. */
export const facing = (h: { x: number; z: number }) => Math.atan2(PLAZA[0] - h.x, PLAZA[1] - h.z);

/** Where the avatar stops: just inside the door. */
export function doorPoint(h: HangarSpec, inside = 1.5): [number, number] {
  const r = facing(h);
  return [h.x + Math.sin(r) * inside, h.z + Math.cos(r) * inside];
}

/** The kopi stall: front-left, facing the camera. The avatar walks to its counter to drink. */
export const KOPI_AT: [number, number, number] = [-6.5, 0, 4.95];
export const KOPI_YAW = Math.PI / 4 + 0.15;
/** Where I stand at the counter (local z = 1.5), and the yaw that faces the counter. */
export const KOPI_STAND: [number, number] = [
  KOPI_AT[0] + Math.sin(KOPI_YAW) * 1.5,
  KOPI_AT[2] + Math.cos(KOPI_YAW) * 1.5,
];
export const KOPI_FACE_YAW = KOPI_YAW + Math.PI;
