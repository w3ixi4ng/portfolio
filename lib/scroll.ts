/**
 * Scroll maths: the single source of truth for zone ranges (CLAUDE.md §4).
 * Pure functions only; no DOM or React here. Runtime scroll state lives in lib/scrollState.ts.
 */

export type ZoneId = "plane" | "freefall" | "formation" | "islands" | "deployment" | "dropzone";

export interface Zone {
  id: ZoneId;
  /** Short label for HUD markers. */
  label: string;
  /** Which content section this zone presents. */
  section: "hero" | "about" | "skills" | "projects" | "experience" | "contact";
  start: number;
  end: number;
}

export const ZONES: readonly Zone[] = [
  { id: "plane", label: "The Plane", section: "hero", start: 0, end: 0.1 },
  { id: "freefall", label: "Freefall", section: "about", start: 0.1, end: 0.3 },
  { id: "formation", label: "Formation", section: "skills", start: 0.3, end: 0.5 },
  { id: "islands", label: "Sky Islands", section: "projects", start: 0.5, end: 0.75 },
  { id: "deployment", label: "Deployment", section: "experience", start: 0.75, end: 0.85 },
  { id: "dropzone", label: "The Dropzone", section: "contact", start: 0.85, end: 1 },
];

export const MAX_ALTITUDE = 13000;

/** How tall the scrollable page is, in viewport heights. */
export const SCROLL_PAGES = 12;

/**
 * Altitude keyframes [scroll, feet]. Piecewise-linear so each zone hits its §4 altitude band.
 * The plane holds 13,000 ft until the door opens, then we exit.
 */
const ALTITUDE_KEYS: readonly (readonly [number, number])[] = [
  [0, 13000],
  [0.052, 13000],
  [0.1, 12000],
  [0.3, 9000],
  [0.5, 6000],
  [0.75, 3000],
  [0.85, 1000],
  [1, 0],
];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Linear interpolation through sorted [x, y] keyframes. */
export function piecewise(keys: readonly (readonly [number, number])[], x: number): number {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return lerp(y0, y1, (x - x0) / (x1 - x0 || 1));
    }
  }
  return keys[keys.length - 1][1];
}

export const altitudeFromScroll = (t: number) => piecewise(ALTITUDE_KEYS, clamp01(t));

export function zoneFromScroll(t: number): Zone {
  const p = clamp01(t);
  return ZONES.find((z) => p < z.end) ?? ZONES[ZONES.length - 1];
}

export const getZone = (id: ZoneId): Zone => ZONES.find((z) => z.id === id) ?? ZONES[0];

/** 0 → 1 progress through a zone (clamped). */
export const zoneProgress = (t: number, zone: Zone) =>
  clamp01((t - zone.start) / (zone.end - zone.start));

/**
 * 0 → 1 → 0 visibility envelope for a zone, with `fade` (in scroll units) ramps at each edge.
 * First/last zones stay fully visible at the very top/bottom of the page.
 */
export function zoneVisibility(t: number, zone: Zone, fade = 0.02): number {
  const isFirst = zone.start <= 0;
  const isLast = zone.end >= 1;
  // Ramps are centred on the boundary so neighbouring zones cross-fade (both 0.5 at the edge).
  const fadeIn = isFirst ? 1 : clamp01((t - zone.start + fade / 2) / fade);
  const fadeOut = isLast ? 1 : clamp01((zone.end + fade / 2 - t) / fade);
  return Math.min(fadeIn, fadeOut);
}

/**
 * Scroll position to land on when navigating to a zone: a little way in,
 * so content has faded in and the camera has settled.
 */
export function scrollTargetForZone(id: ZoneId): number {
  const z = getZone(id);
  if (z.start <= 0) return 0;
  return z.start + (z.end - z.start) * 0.25;
}

export const formatAltitude = (ft: number) =>
  Math.max(0, Math.round(ft / 10) * 10).toLocaleString("en-US");
