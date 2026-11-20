/**
 * World-space layout of the jump + camera keyframes (CLAUDE.md §4, design/STYLE.md §5).
 * Avatar height tracks altitude (1 world unit = 100 ft). The ground diorama sits at y = 0
 * and is always visible far below. Zone timings come from lib/scroll.ts.
 */
import { CatmullRomCurve3, Vector3 } from "three";
import { altitudeFromScroll, clamp01, getZone, piecewise, type ZoneId } from "@/lib/scroll";

export const FT_TO_UNITS = 0.01;
export const GROUND_Y = 0;
/** Plane cabin floor (13,000 ft). */
export const PLANE_FLOOR_Y = 130;
/** Low FOV so everything reads as a tabletop miniature. */
export const CAMERA_FOV = 32;
export const PORTRAIT_DISTANCE = 1.55;

export const yForAltitude = (ft: number) => Math.max(GROUND_Y, ft * FT_TO_UNITS);

type V3 = readonly [number, number, number];

interface CameraKey {
  t: number;
  /** Avatar x/z (y comes from altitude). */
  avatarXZ: readonly [number, number];
  /** Degrees below horizontal: ≈40–50 diorama 3/4, ≈75–85 top-down. */
  pitch: number;
  /** Degrees around +y; 0 = camera on +z looking toward −z. */
  yaw: number;
  distance: number;
  /**
   * Look-at offset from the avatar. x/z frame the subject sideways on screen (e.g. +x in
   * top-down so the avatar sits centred left of the content card) and are dropped on
   * portrait screens, where the card sits below instead.
   */
  focus: V3;
  /** Field of view (defaults to CAMERA_FOV). The finale widens it to take in the skyline. */
  fov?: number;
}

const z = (id: ZoneId) => getZone(id);

/**
 * The exit, in scroll units: stand in the cabin → walk to the open ramp → leap → fall belly-down.
 * Shared by the avatar and the two jump buddies so everyone leaves the plane the same way.
 */
export const EXIT = {
  /** Ramp opens between these. */
  rampFrom: 0.008,
  rampTo: 0.04,
  walk: 0.028,
  door: 0.052,
  leap: 0.075,
  /** Fully belly-to-earth from here. */
  belly: 0.1,
} as const;

/** A short hop up as you leave the ramp, over EXIT.door → EXIT.leap. */
export function leapHop(t: number, height = 0.9): number {
  const k = (t - EXIT.door) / (EXIT.leap - EXIT.door);
  return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k) * height;
}

const KEYS: readonly CameraKey[] = [
  // Plane: 3/4 dollhouse view, subject framed right of the hero card.
  { t: 0, avatarXZ: [-1.6, 0], pitch: 38, yaw: 45, distance: 24, focus: [-1.4, 0.8, 1.4] },
  // Hold in the cabin, then walk to the ramp (x ≈ 3.0) and leap (see EXIT below).
  { t: EXIT.walk, avatarXZ: [-1.6, 0], pitch: 38, yaw: 45, distance: 24, focus: [-1.4, 0.8, 1.4] },
  {
    t: EXIT.door,
    avatarXZ: [3.0, 0.05],
    pitch: 42,
    yaw: 45,
    distance: 21,
    focus: [-2.4, 0.6, 2.4],
  },
  { t: EXIT.leap, avatarXZ: [4.6, 0.2], pitch: 52, yaw: 36, distance: 19, focus: [-0.6, 0.2, 0.9] },
  // Exit: swing overhead within ~0.05 of scroll.
  {
    t: z("freefall").start + 0.01,
    avatarXZ: [3.4, 0.3],
    pitch: 74,
    yaw: 20,
    distance: 15,
    focus: [1.4, 0, 0.7],
  },
  { t: 0.2, avatarXZ: [1.2, 0], pitch: 80, yaw: 8, distance: 14, focus: [1.6, 0, 0.8] },
  // Formation: pull up so the ring fits.
  {
    t: z("formation").start,
    avatarXZ: [0, 0],
    pitch: 82,
    yaw: 0,
    distance: 20,
    focus: [2.8, 0, 0.9],
  },
  { t: 0.42, avatarXZ: [0, 0], pitch: 82, yaw: 0, distance: 21, focus: [2.8, 0, 0.9] },
  // Sky islands: widest overhead framing; islands drift past on either side.
  {
    t: z("islands").start,
    avatarXZ: [0, 0],
    pitch: 78,
    yaw: 0,
    distance: 28,
    focus: [3.2, 0, 1.2],
  },
  { t: 0.625, avatarXZ: [0.3, 0.3], pitch: 76, yaw: 0, distance: 28, focus: [3.2, 0, 1.2] },
  // Deployment: ease out of top-down into a 3/4 chase so the canopy doesn't hide me.
  {
    t: z("deployment").start,
    avatarXZ: [0, 0],
    pitch: 50,
    yaw: 30,
    distance: 17,
    focus: [0, 1.6, 0],
  },
  { t: 0.8, avatarXZ: [-1, 1], pitch: 34, yaw: 40, distance: 17, focus: [0, 1.6, 0] },
  // Dropzone: settle into the diorama view of the landing area.
  {
    t: z("dropzone").start,
    avatarXZ: [-1.2, 1.8],
    pitch: 38,
    yaw: 42,
    distance: 27,
    focus: [1.5, -2, -1.5],
  },
  { t: 0.94, avatarXZ: [-0.4, 1.4], pitch: 42, yaw: 44, distance: 30, focus: [1.5, -1.2, -1.9] },
  { t: 0.978, avatarXZ: [0, 1.2], pitch: 40, yaw: 45, distance: 30, focus: [1.8, -0.4, -2.2] },
  // Finale: after touching down the camera tilts up and widens to reveal Marina Bay on the
  // horizon (design: Singapore touch). Hangar and avatar stay in the lower part of the frame.
  {
    t: 1,
    avatarXZ: [0, 1.2],
    pitch: 11,
    yaw: 45,
    distance: 21,
    focus: [1.8, 2.6, -3.0],
    fov: 50,
  },
];

const toU: readonly (readonly [number, number])[] = KEYS.map(
  (k, i) => [k.t, i / (KEYS.length - 1)] as const,
);

const avatarCurve = new CatmullRomCurve3(
  KEYS.map((k) => new Vector3(k.avatarXZ[0], 0, k.avatarXZ[1])),
  false,
  "centripetal",
);
/** (pitch, yaw, distance) eased along a CatmullRom so the camera swings smoothly. */
const orbitCurve = new CatmullRomCurve3(
  KEYS.map((k) => new Vector3(k.pitch, k.yaw, k.distance)),
  false,
  "centripetal",
);
const focusCurve = new CatmullRomCurve3(KEYS.map((k) => new Vector3(...k.focus)));
const fovKeys = KEYS.map((k) => [k.t, k.fov ?? CAMERA_FOV] as const);

/** Map scroll → curve parameter so each key lands exactly at its scroll position. */
const uFromScroll = (t: number) => piecewise(toU, clamp01(t));

/** Avatar feet position. In the plane the avatar stands on the cabin floor. */
export function getAvatarPosition(t: number, out: Vector3): Vector3 {
  avatarCurve.getPoint(uFromScroll(t), out);
  out.y = Math.min(PLANE_FLOOR_Y, yForAltitude(altitudeFromScroll(t))) + leapHop(t);
  return out;
}

export const getFov = (t: number) => piecewise(fovKeys, clamp01(t));

/** x = pitch°, y = yaw°, z = distance. */
export const getOrbit = (t: number, out: Vector3) => orbitCurve.getPoint(uFromScroll(t), out);

export const getFocusOffset = (t: number, out: Vector3) => focusCurve.getPoint(uFromScroll(t), out);

/** Unit vector from the look-at point toward the camera for a pitch/yaw in degrees. */
export function orbitDirection(pitchDeg: number, yawDeg: number, out: Vector3): Vector3 {
  const p = (pitchDeg * Math.PI) / 180;
  const y = (yawDeg * Math.PI) / 180;
  return out.set(Math.cos(p) * Math.sin(y), Math.sin(p), Math.cos(p) * Math.cos(y));
}

/** World position the avatar passes at scroll t (convenient for placing things en route). */
export const avatarAt = (t: number) => getAvatarPosition(t, new Vector3());

/** Evenly spread n items across a zone's scroll range (centres of equal slices). */
export const spreadInZone = (id: ZoneId, n: number, i: number, padding = 0.1) => {
  const zone = getZone(id);
  const span = zone.end - zone.start;
  const start = zone.start + span * padding;
  const usable = span * (1 - padding * 2);
  return start + usable * ((i + 0.5) / Math.max(1, n));
};
