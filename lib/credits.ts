/**
 * 3D asset credits (CLAUDE.md §3: record every credit and show it in a site footer).
 * Mirrored in public/models/CREDITS.md. CC0 packs need no credit; listed as thanks.
 */
export interface Credit {
  work: string;
  author: string;
  licence: "CC0" | "CC-BY 3.0" | "CC-BY 4.0";
  url: string;
}

export const CREDITS: readonly Credit[] = [
  {
    work: "Small Airplane",
    author: "Vojtěch Balák",
    licence: "CC-BY 3.0",
    url: "https://poly.pizza/m/7cvx6ex-xfL",
  },
  {
    work: "City Builder, Furniture, Restaurant & Resource Bits; Adventurers",
    author: "Kay Lousberg (KayKit)",
    licence: "CC0",
    url: "https://kaylousberg.itch.io",
  },
  {
    work: "Nature Kit, Food Kit, City Kit Commercial, City Kit Industrial, Survival Kit, Car Kit",
    author: "Kenney",
    licence: "CC0",
    url: "https://kenney.nl",
  },
];
