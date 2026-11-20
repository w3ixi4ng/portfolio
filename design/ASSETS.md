# ASSETS.md: which CC0 models go where

Raw packs live in `design/asset-packs/` (gitignored). Only models listed here get recoloured, combined
per zone and optimised into `public/models/` (`npx gltfjsx --transform --types`). All packs below are
**CC0** (licence files checked 2026-11-19); credits are listed anyway in `public/models/CREDITS.md`.

**Formats:** every pick is already glTF/GLB, so **no conversion is needed**. (The OpenGameArt *Cartoon Plane* ships as `.blend` only and Blender isn't installed, so it's unused.) The Quaternius *Ultimate
Nature Pack* (FBX/OBJ/Blend only) is **not used**: the Stylized Nature MegaKit covers the same trees
and rocks in glTF, and mixing both would break the "one tree style per scene" rule.

**Author per category (never two authors' versions of the same thing in a scene):**
| Category | Author |
|---|---|
| Buildings, street furniture, roads | KayKit City Builder |
| Indoor furniture | KayKit Furniture |
| Kitchen / stall / table props | KayKit Restaurant |
| Crates, pallets, barrels, logs, bricks | KayKit Resource |
| Trees, bushes, grass, flowers, rocks | Kenney Nature Kit (MegaKit dropped: painterly alpha foliage clashed with KayKit and weighed ~80 MB) |
| Palms, crop rows, fences, bridges | Kenney Nature (no equivalent elsewhere) |
| Cups, mugs, steamer, small food | Kenney Food (KayKit Restaurant has no cups) |
| Jumpers | KayKit Adventurers **Rogue** (CC0, rigged) dressed in code: plain jumpsuit, helmet, goggles, rig, star |
| Parked plane at the dropzone | Poly Pizza *Small Airplane* by Vojtěch Balák (**CC-BY 3.0**, credited) |
| Jump plane, canopy, clouds, hangar shell, windsock | **code-built** (CLAUDE.md §3) |

---

## Per zone

### Plane (0.00–0.10): 3/4 dollhouse cut-away
Code-built cabin. Clutter only:
- KayKit Resource: `Textiles_A`, `Textiles_Stack_Small` (gear bags), `Pallet_Wood`
- KayKit Furniture: `chair_stool` (jump seat), `pictureframe_small_A` (safety card on the wall)

### Freefall → Islands, ground far below (always visible, CLAUDE.md §4)
The ground patchwork seen from 12,000 ft down to 3,000 ft:
- KayKit City Builder: `road_straight`, `road_corner_curved`, `road_junction`, `building_A`–`building_H`
  (tiny town blocks), `watertower`, `bush`
- Kenney Nature: `crops_dirtRow`, `crops_wheatStageB`, `crops_cornStageC`, `fence_simple` (field patchwork)
- MegaKit: `CommonTree_1`–`5` (instanced clumps), `Bush_Common`

### Formation (0.30–0.50)
Code-built jumpers only. (Quaternius Platformer character stays a **rig/animation reference**, not used.)

### Sky Islands (0.50–0.75): one diorama per project, seen from above
| Project | Theme | Picks |
|---|---|---|
| **Bidly** (busy market + auctioneer) | city | City: `building_C`, `bench`, `streetlight`; Restaurant: `table_round_A`, `crate_tomatoes`, `crate_carrots`, `crate_cheese`, `chair_stool`, `menu`; Resource: `Pallet_Wood_Covered_A`; code: gavel podium, bid paddles |
| **Platform Migration** (two islands + rope bridge, rainy cloud, blinking tower) | snow | Kenney: `bridge_woodNarrow` (rope-bridge deck); City: `watertower` (monitoring tower body), `streetlight` (blinking beacon); MegaKit: `Pine_1`–`3` (snow-recoloured), `Rock_Medium_1` |
| **Booking System** (office + flipping calendar) | beach | Furniture: `table_medium`, `chair_A`, `shelf_B_small_decorated`, `lamp_table`, `pictureframe_standing_A`; Kenney: `tree_palmShort`, `tree_palmBend`; code: flip calendar |
| **Content Pipeline** (printing press + newspapers) | desert | Resource: `Parts_Cog`, `Parts_Pile_Medium`, `Textiles_Stack_Large` (paper stacks), `Pallet_Wood`; Furniture: `book_set`, `cactus_medium_A`, `cactus_small_B`; code: press body, flying newspapers |
| *(spare: forest theme)* | forest | MegaKit: `CommonTree_2`, `Bush_Common_Flowers`, `Mushroom_Common`, `Fern_1`; City: `bench` |

### Deployment (0.75–0.85)
Code-built canopy and waypoint clouds. Flags on waypoints: code. No pack models.

### Dropzone (0.85–1.00): 3/4 diorama
- Ground dressing, MegaKit: `CommonTree_1`, `CommonTree_4`, `Bush_Common_Flowers`, `Grass_Common_Short`,
  `Flower_3_Group`, `Flower_4_Group`, `RockPath_Round_Wide` (path to hangar), `Pebble_Round_1`–`3`
- Kenney Nature: `fence_simple`, `fence_gate`
- Street bits, City: `bench`, `trash_A`, `streetlight`, `box_A`, `firehydrant`
- Packing area, Resource: `Pallet_Wood`, `Textiles_Stack_Large_Colored` (packed canopies),
  `Fuel_A_Barrel`, `Wood_Log_Stack`; Furniture: `rug_rectangle_stripes_A` (packing mat), `chair_stool`
- **Kopi stall (only if `settings.singaporeTouch`)**, Restaurant: `kitchencounter_straight_A_decorated`,
  `table_round_A_small`, `chair_stool`, `jar_A_medium`, `jar_B_small`, `pot_A`; Kenney Food: `cup-coffee`,
  `cup-tea`, `steamer`, `mug`
- Code: hangar shell ("Hangar-01 (HA)"), windsock, landing target, notice board

---

## Pipeline (per zone)
1. Copy the picked `.gltf` (+ `.bin`, atlas) out of `design/asset-packs/`.
2. KayKit: point materials at our warm-graded atlas (`design/palette.png`, see STYLE.md §8).
   Kenney/Quaternius: remap each material colour to the nearest STYLE.md palette token.
3. Merge the zone's picks into one `public/models/<zone>.glb` (named nodes), then
   `npx gltfjsx public/models/<zone>.glb --transform --types` → typed component in `components/canvas/props/`.
4. Repeated items (trees, fences, crates, crops) → `<Instances>`.
5. Budget check: all of `public/models/` < 5 MB total (CLAUDE.md §9).

> **Status (2026-11-19):** the picks above are built by `pnpm models` (`scripts/build-models.mjs`); the
> exact list lives in that script. Nature picks moved to Kenney (see table). Total ≈ 2.8 MB.
