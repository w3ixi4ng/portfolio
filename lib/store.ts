import { create } from "zustand";
import { settings } from "@/content";
import { TIMES, type TimeOfDay } from "./daylight";
import type { QualityTier } from "./quality";
import type { ZoneId } from "./scroll";

/** The three hangars at the dropzone. */
export type HubSection = "projects" | "experience" | "skills";

/** Which detail panel is open. Opened from in-world signs/bubbles, zone cards or the HUD. */
export type PanelRef =
  | { kind: "about" }
  | { kind: "skills"; index: number }
  | { kind: "project"; slug: string }
  | { kind: "experience"; index: number }
  | { kind: "contact" }
  /** A hangar's contents: the full list of projects / experience / skills. */
  | { kind: "hub"; section: HubSection };

/** Easter eggs (CLAUDE.md §5). Order = the list in CLAUDE.md. */
export const EGGS = [
  "buddy-flip",
  "pigeon",
  "selfie",
  "windsock",
  "packer",
  "line-twists",
  "reserve",
] as const;
export type EggId = (typeof EGGS)[number];

interface AppState {
  /** Zone the (damped) scroll position is currently in. Changes only at zone boundaries. */
  activeZone: ZoneId;
  setActiveZone: (zone: ZoneId) => void;
  /** True once the scroll runtime has read the real position (after hydration). */
  scrollReady: boolean;

  /** Sound is opt-in; never autoplayed. */
  soundOn: boolean;
  toggleSound: () => void;

  panel: PanelRef | null;
  /** Where "← Back" goes (set when a detail is opened from a hangar list). */
  backTo: PanelRef | null;
  openPanel: (panel: PanelRef) => void;
  closePanel: () => void;

  /** Having a kopi at the stall (drink pose + a cup in hand). */
  drinking: boolean;
  setDrinking: (v: boolean) => void;

  /** The avatar is walking between hangars (drives its run animation). */
  walking: boolean;
  setWalking: (v: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  quality: QualityTier;
  setQuality: (q: QualityTier) => void;

  /** 3D asset loading, reported from inside the lazily loaded canvas bundle. */
  load: { active: boolean; progress: number; total: number };
  setLoad: (load: { active: boolean; progress: number; total: number }) => void;

  /** Easter egg: the main canopy was cut away and the reserve is open (until I land or scroll back). */
  reserve: boolean;
  setReserve: (v: boolean) => void;

  /** Time of day (sunrise / day / golden hour / night). Starts from Singapore time; cyclable. */
  tod: TimeOfDay;
  setTod: (t: TimeOfDay) => void;
  cycleTod: () => void;

  /** Easter eggs found this visit (for the "🪂 3/8 found" counter). */
  eggsFound: EggId[];
  findEgg: (id: EggId) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  activeZone: "plane",
  setActiveZone: (activeZone) => set({ activeZone, scrollReady: true }),
  scrollReady: false,

  // Only the toggle's initial state; audio itself still never autoplays.
  soundOn: settings.soundDefaultOn,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  panel: null,
  backTo: null,
  openPanel: (panel) =>
    set((s) => ({
      panel,
      backTo: s.panel?.kind === "hub" && panel.kind !== "hub" ? s.panel : null,
    })),
  closePanel: () => set({ panel: null, backTo: null }),

  walking: false,
  setWalking: (walking) => set({ walking }),

  drinking: false,
  setDrinking: (drinking) => set({ drinking }),

  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  quality: "medium",
  setQuality: (quality) => set({ quality }),

  load: { active: false, progress: 0, total: 0 },
  setLoad: (load) => set({ load }),

  reserve: false,
  setReserve: (reserve) => set({ reserve }),

  tod: "day",
  setTod: (tod) => set({ tod }),
  cycleTod: () => set((s) => ({ tod: TIMES[(TIMES.indexOf(s.tod) + 1) % TIMES.length] })),

  eggsFound: [],
  findEgg: (id) =>
    set((s) =>
      !settings.easterEggsEnabled || s.eggsFound.includes(id)
        ? s
        : { eggsFound: [...s.eggsFound, id] },
    ),
}));
