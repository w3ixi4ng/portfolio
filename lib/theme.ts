/**
 * Palette measured from design/references (see design/STYLE.md §2, which wins on visual details).
 * Mirrors the CSS variables in app/globals.css. Keep both in sync.
 */
export const palette = {
  // sky + atmosphere
  skyTop: "#86C2DC",
  skyBottom: "#F4CFA4",
  dusk: "#C9A3B6",
  cloud: "#FFF6EC",
  sun: "#FFC98A",
  shadow: "#6E6C86",
  // accents (small objects only)
  canopyRed: "#D0402C",
  canopyYellow: "#E6B04E",
  canopyTeal: "#4E9C8F",
  signNavy: "#26458C",
  // surfaces
  cream: "#F2EBD9",
  paper: "#FBF7EE",
  terrazzo: "#D3CFC4",
  terracotta: "#B4644A",
  terracottaDeep: "#7F4434",
  sage: "#A3BCA6",
  grass: "#7E9645",
  grassLit: "#ADB863",
  foliageDeep: "#47592F",
  earth: "#9A6B4C",
  // text
  ink: "#2B2A30",
  inkSoft: "#5E5A63",
  // signboard woods (HUD; pending STYLE.md §9 decision)
  wood: "#9A5F33",
  woodDark: "#5E3B22",
} as const;

/** Skin tones for jumpers (STYLE.md §2). */
export const skinTones = ["#E8BE96", "#CE9F7B", "#B57257", "#A1634D"] as const;

export interface SkyStop {
  altitude: number;
  top: string;
  bottom: string;
}

/**
 * Sky gradient keyed by altitude (ft): deep blue up high → warm peach near the ground.
 * Must be sorted by descending altitude.
 */
export const skyStops: readonly SkyStop[] = [
  { altitude: 13000, top: "#4F8DBF", bottom: "#A9D2E2" },
  { altitude: 8000, top: "#6AA9CF", bottom: palette.skyTop },
  { altitude: 3000, top: palette.skyTop, bottom: "#F7DDBC" },
  { altitude: 0, top: "#9CCADB", bottom: palette.skyBottom },
];

/** Suit colours for placeholder jumpers. */
export const suitColors = [
  palette.canopyRed,
  palette.canopyYellow,
  palette.canopyTeal,
  palette.signNavy,
  palette.terracotta,
] as const;

export const islandColors: Record<string, { top: string; side: string; accent: string }> = {
  city: { top: palette.terrazzo, side: palette.earth, accent: palette.canopyRed },
  forest: { top: palette.grass, side: palette.earth, accent: palette.foliageDeep },
  beach: { top: "#EAD7A8", side: "#C99E6E", accent: palette.canopyTeal },
  desert: { top: "#E2B27A", side: palette.terracotta, accent: palette.canopyYellow },
  snow: { top: "#F3F1EC", side: "#A4A8B8", accent: palette.skyTop },
};
