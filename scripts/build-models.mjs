#!/usr/bin/env node
/**
 * Copies the models picked in design/ASSETS.md out of design/asset-packs/ (gitignored raw
 * CC0/CC-BY downloads) and writes compact meshopt-compressed .glb files to public/models/.
 *
 *   pnpm models
 *
 * Re-run after changing PICKS. Only these optimised files ship; the raw packs never do.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, resample, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const ROOT = path.resolve(import.meta.dirname, "..");
const PACKS = path.join(ROOT, "design", "asset-packs");
const OUT = path.join(ROOT, "public", "models");

/** [output folder, pack folder (under asset-packs), sub-path, names[], ext] */
const PICKS = [
  [
    "city",
    "kaykit-city-builder/KayKit_City_Builder_Bits_1.0_FREE/Assets/gltf",
    [
      "building_A",
      "building_B",
      "building_C",
      "building_D",
      "building_E",
      "building_F",
      "building_G",
      "building_H",
      "bench",
      "streetlight",
      "watertower",
      "bush",
      "car_hatchback",
      "car_sedan",
      "car_taxi",
      "box_A",
      "box_B",
      "firehydrant",
      "trash_A",
    ],
    ".gltf",
  ],
  [
    "furniture",
    "kaykit-furniture/KayKit_Furniture_Bits_1.0_FREE/Assets/gltf",
    [
      "table_medium",
      "chair_A",
      "shelf_B_small_decorated",
      "lamp_table",
      "pictureframe_standing_A",
      "book_set",
      "cactus_medium_A",
      "cactus_small_B",
      "chair_stool",
      "rug_rectangle_stripes_A",
    ],
    ".gltf",
  ],
  [
    "resource",
    "kaykit-resource/KayKit_ResourceBits_1.0_FREE/Assets/gltf",
    [
      "Pallet_Wood",
      "Pallet_Wood_Covered_A",
      "Textiles_Stack_Large_Colored",
      "Textiles_Stack_Large",
      "Textiles_A",
      "Fuel_A_Barrel",
      "Wood_Log_Stack",
      "Parts_Cog",
      "Parts_Pile_Medium",
    ],
    ".gltf",
  ],
  [
    "restaurant",
    "kaykit-restaurant/KayKit_Restaurant_Bits_1.0_FREE/Assets/gltf",
    [
      "table_round_A",
      "table_round_A_small",
      "chair_stool",
      "crate_tomatoes",
      "crate_carrots",
      "crate_cheese",
      "menu",
      "kitchencounter_straight_A_decorated",
      "jar_A_medium",
      "jar_B_small",
      "pot_A",
    ],
    ".gltf",
  ],
  // Nature: Kenney (flat colours, chunky) rather than the MegaKit, whose painterly
  // alpha-card foliage clashes with KayKit and weighs ~80 MB (design/ASSETS.md).
  [
    "nature",
    "kenney-nature/Models/GLTF format",
    [
      "tree_oak",
      "tree_default",
      "tree_fat",
      "tree_detailed",
      "tree_small",
      "tree_pineRoundA",
      "tree_pineRoundC",
      "tree_pineTallA",
      "plant_bush",
      "plant_bushLarge",
      "plant_bushSmall",
      "flower_redA",
      "flower_yellowA",
      "flower_purpleA",
      "grass",
      "grass_large",
      "rock_largeA",
      "rock_smallA",
      "mushroom_redGroup",
      "stump_round",
      "log_stack",
    ],
    ".glb",
  ],
  [
    "kenney",
    "kenney-nature/Models/GLTF format",
    [
      "tree_palmShort",
      "tree_palmBend",
      "fence_simple",
      "fence_gate",
      "crops_wheatStageB",
      "crops_cornStageC",
      "bridge_woodNarrow",
    ],
    ".glb",
  ],
  ["kenney", "kenney-food/Models/GLB format", ["cup-coffee", "cup-tea", "steamer", "mug"], ".glb"],
  [
    "characters",
    "kaykit-adventurers/KayKit_Adventurers_2.0_FREE/Characters/gltf",
    ["Rogue", "Ranger", "Barbarian", "Knight", "Mage"],
    ".glb",
  ],
  [
    "characters",
    "kaykit-adventurers/KayKit_Adventurers_2.0_FREE/Animations/gltf/Rig_Medium",
    ["Rig_Medium_General", "Rig_Medium_MovementBasic"],
    ".glb",
  ],
  // Kenney City Kits (CC0): the far skyline and an industrial district.
  [
    "commercial",
    "kenney-city-commercial/Models/GLB format",
    [
      ..."abcde".split("").map((c) => `building-skyscraper-${c}`),
      ..."abcdefghijkl".split("").map((c) => `building-${c}`),
      ..."abcdefghijkl".split("").map((c) => `low-detail-building-${c}`),
      "low-detail-building-wide-a",
      "low-detail-building-wide-b",
    ],
    ".glb",
  ],
  [
    "industrial",
    "kenney-city-industrial/Models/GLB format",
    [
      "water-tower",
      "chimney-large",
      "chimney-basic",
      "chimney-medium",
      "detail-tank-large",
      "shipping-container-a",
      "shipping-container-b",
      "shipping-container-c",
      "windmill",
      "solar-panel-landscape-group",
      "building-a",
      "building-c",
      "building-e",
      "building-h",
      "building-k",
    ],
    ".glb",
  ],
  // CC-BY: credited in public/models/CREDITS.md and the site footer.
  ["misc", "poly-pizza", ["small-airplane-balak"], ".glb"],
];

/** Kenney's GLTF folder sometimes nests files one level down; find the file by name. */
function locate(dir, name, ext) {
  const direct = path.join(dir, name + ext);
  if (existsSync(direct)) return direct;
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) {
      const hit = locate(p, name, ext);
      if (hit) return hit;
    }
  }
  return null;
}

await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });

let total = 0;
let count = 0;
const missing = [];
for (const [folder, sub, names, ext] of PICKS) {
  const dir = path.join(PACKS, sub);
  mkdirSync(path.join(OUT, folder), { recursive: true });
  for (const name of names) {
    const src = existsSync(dir) ? locate(dir, name, ext) : null;
    if (!src) {
      missing.push(`${sub}/${name}${ext}`);
      continue;
    }
    const doc = await io.read(src);
    const skinned = doc.getRoot().listSkins().length > 0;
    await doc.transform(
      dedup(),
      prune(),
      // Welding skinned meshes can merge vertices across bone weights; leave those alone.
      ...(skinned ? [] : [weld()]),
      resample(),
      meshopt({ encoder: MeshoptEncoder, level: "medium" }),
    );
    const out = path.join(OUT, folder, `${name}.glb`);
    await io.write(out, doc);
    total += statSync(out).size;
    count++;
  }
}

console.log(`wrote ${count} models, ${(total / 1024 / 1024).toFixed(2)} MB total`);
if (missing.length) {
  console.error(`missing (${missing.length}):\n  ${missing.join("\n  ")}`);
  process.exitCode = 1;
}
