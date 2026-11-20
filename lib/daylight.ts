import { Color } from "three";

/**
 * Time of day. The jump is lit by Singapore time (the visitor's own clock is irrelevant: it's
 * "my" sky): sunrise in the morning, golden hour in the evening, a night jump after dark.
 * The HUD can cycle through the four looks; `daylight` is the live, eased state that the sky,
 * lights, lamps and glowing windows read every frame.
 */
export type TimeOfDay = "sunrise" | "day" | "golden" | "night";
export const TIMES: readonly TimeOfDay[] = ["sunrise", "day", "golden", "night"];

export const TIME_LABEL: Record<TimeOfDay, string> = {
  sunrise: "Sunrise",
  day: "Daytime",
  golden: "Golden hour",
  night: "Night",
};

/** Which look applies at a Singapore wall-clock hour (0–24, fractional). */
export function timeOfDayAt(hour: number): TimeOfDay {
  if (hour >= 5.5 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 19.25) return "golden";
  return "night";
}

/** Current time in Singapore, independent of the visitor's timezone. */
export function singaporeHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return (get("hour") % 24) + get("minute") / 60;
}

export const currentTimeOfDay = () => timeOfDayAt(singaporeHour());

interface Look {
  /** How strongly the sky is pushed toward the tint colours (0 = plain altitude gradient). */
  tintTop: string;
  tintTopAmount: number;
  tintBottom: string;
  tintBottomAmount: number;
  night: number;
  sunColor: string;
  sunIntensity: number;
  /** 0 = high sun, 1 = very low sun (longer shadows). */
  sunLow: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  ambient: number;
  /** Sun glow in the sky shader. */
  glow: number;
}

const LOOKS: Record<TimeOfDay, Look> = {
  sunrise: {
    tintTop: "#9C93D0",
    tintTopAmount: 0.45,
    tintBottom: "#FFA987",
    tintBottomAmount: 0.8,
    night: 0,
    sunColor: "#FFB48A",
    sunIntensity: 2.3,
    sunLow: 0.85,
    hemiSky: "#C9C4E8",
    hemiGround: "#F0C3A3",
    hemiIntensity: 0.95,
    ambient: 0.14,
    glow: 0.4,
  },
  day: {
    tintTop: "#000000",
    tintTopAmount: 0,
    tintBottom: "#000000",
    tintBottomAmount: 0,
    night: 0,
    sunColor: "#FFC98A",
    sunIntensity: 2.6,
    sunLow: 0.2,
    hemiSky: "#BFD9EA",
    hemiGround: "#E6CFAF",
    hemiIntensity: 1.05,
    ambient: 0.15,
    glow: 0.18,
  },
  golden: {
    tintTop: "#B987A8",
    tintTopAmount: 0.4,
    tintBottom: "#FF9457",
    tintBottomAmount: 0.85,
    night: 0,
    sunColor: "#FF9D52",
    sunIntensity: 2.8,
    sunLow: 0.95,
    hemiSky: "#E6BFA8",
    hemiGround: "#D9936A",
    hemiIntensity: 0.9,
    ambient: 0.13,
    glow: 0.55,
  },
  night: {
    tintTop: "#0E1633",
    tintTopAmount: 1,
    tintBottom: "#3A3466",
    tintBottomAmount: 1,
    night: 1,
    sunColor: "#8FA6FF",
    sunIntensity: 0.5,
    sunLow: 0.3,
    hemiSky: "#5A6CA8",
    hemiGround: "#2E2A48",
    hemiIntensity: 0.55,
    ambient: 0.1,
    glow: 0,
  },
};

/** Live, eased state (mutated each frame by DaylightDriver). Colours are THREE.Color. */
export const daylight = {
  night: 0,
  /** Horizon colour right now (the sky's bottom colour), for haze that must match it. */
  horizon: new Color(),
  tintTop: new Color(),
  tintTopAmount: 0,
  tintBottom: new Color(),
  tintBottomAmount: 0,
  sunColor: new Color(),
  sunIntensity: 2.6,
  sunLow: 0.2,
  hemiSky: new Color(),
  hemiGround: new Color(),
  hemiIntensity: 1.05,
  ambient: 0.15,
  glow: 0.18,
};

const scratch = new Color();

/** Ease the live state toward a look. `k` is the 0–1 blend for this frame. */
export function easeDaylight(tod: TimeOfDay, k: number) {
  const t = LOOKS[tod];
  const num = (cur: number, to: number) => cur + (to - cur) * k;
  daylight.night = num(daylight.night, t.night);
  daylight.tintTopAmount = num(daylight.tintTopAmount, t.tintTopAmount);
  daylight.tintBottomAmount = num(daylight.tintBottomAmount, t.tintBottomAmount);
  daylight.sunIntensity = num(daylight.sunIntensity, t.sunIntensity);
  daylight.sunLow = num(daylight.sunLow, t.sunLow);
  daylight.hemiIntensity = num(daylight.hemiIntensity, t.hemiIntensity);
  daylight.ambient = num(daylight.ambient, t.ambient);
  daylight.glow = num(daylight.glow, t.glow);
  daylight.tintTop.lerp(scratch.set(t.tintTop), k);
  daylight.tintBottom.lerp(scratch.set(t.tintBottom), k);
  daylight.sunColor.lerp(scratch.set(t.sunColor), k);
  daylight.hemiSky.lerp(scratch.set(t.hemiSky), k);
  daylight.hemiGround.lerp(scratch.set(t.hemiGround), k);
}

/** Snap straight to a look (first frame / reduced motion). */
export const snapDaylight = (tod: TimeOfDay) => easeDaylight(tod, 1);
