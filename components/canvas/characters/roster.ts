import { kitUrl, type KitName } from "../props/Kit";

/**
 * The cast: KayKit Adventurers (CC0), each with its own face/hair. Their weapons, capes and
 * hats are hidden (we dress everyone as a skydiver), so the face is what tells them apart.
 */
export type CharacterId = "ranger" | "rogue" | "barbarian" | "knight" | "mage";

export const CHARACTERS: Record<CharacterId, { model: KitName }> = {
  ranger: { model: "characters/Ranger" },
  rogue: { model: "characters/Rogue" },
  barbarian: { model: "characters/Barbarian" },
  knight: { model: "characters/Knight" },
  mage: { model: "characters/Mage" },
};

export const characterUrl = (id: CharacterId) => kitUrl(CHARACTERS[id].model);

/** Handy round-robin for crowds. */
export const CAST: readonly CharacterId[] = ["rogue", "barbarian", "mage", "knight", "ranger"];

/** Mesh names to hide on every character. */
export const HIDDEN_PARTS = /Cape|Hat|Helmet|Quiver|Mask/i;
