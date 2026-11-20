# STYLE.md: visual rules for Tiny Freefall

Derived from the mood references in `design/references/` (Tiny Kopitiam screenshots, gitignored)
and the KayKit packs (our house style for models). **This file wins over CLAUDE.md on visual details.**
We capture the *feeling* of the references: never their assets, characters, signs, logo, UI or any
specific scene.

---

## 1. The look in one line

A **soft-lit toy diorama**: smooth matte shapes, a warm low sun, long soft shadows and rich ambient
occlusion, everything in sharp focus (the owner wants no blur, unlike the references).

What it is **not**: cel/toon shading, ink outlines, flat unlit colour, neon, or crisp-everywhere
"game engine default" rendering.

---

## 2. Palette (measured from the references)

Hex values come from quantising the well-lit, saturated pixels of the references, rounded and nudged
slightly warmer. These replace the CLAUDE.md starting palette; mirrored in `app/globals.css` and `lib/theme.ts`.

### Surfaces (most of the screen)
| Token | Hex | Where it shows up |
|---|---|---|
| `cream` | `#F2EBD9` | walls, panels, light props (measured `#EFE8D2`, `#FAF2DD`) |
| `paper` | `#FBF7EE` | UI panels, brightest highlights |
| `terrazzo` | `#D3CFC4` | floors, pavement, concrete (measured `#C7CABA`, `#D2B9B4`) |
| `terracotta` | `#B4644A` | roof tiles, brick dados, clay pots (measured `#B06C52`, `#AD543E`) |
| `terracotta-deep` | `#7F4434` | roof shadow side, wood trim (measured `#804736`) |
| `sage` | `#A3BCA6` | painted timber walls, shutters (measured `#D1DCC3` lit, `#708A77` shade) |
| `grass` | `#7E9645` | lawns, island tops (measured `#668041`, `#8A9E4C`) |
| `grass-lit` | `#ADB863` | sunlit grass edges (measured `#ABB860`) |
| `foliage-deep` | `#47592F` | tree canopies in shade (measured `#41562E`) |
| `earth` | `#9A6B4C` | soil band under islands, paths |

### Accents (small, saturated, used sparingly like the red plastic chairs)
| Token | Hex | Use |
|---|---|---|
| `canopy-red` | `#D0402C` | hero accent: canopies, plane hull, primary button (measured `#B42C1E` in shade) |
| `canopy-yellow` | `#E6B04E` | mustard yellow: canopy cells, highlights (measured `#DBAB65`) |
| `canopy-teal` | `#4E9C8F` | muted teal: canopy cells, hangar (references have no neon teal) |
| `sign-navy` | `#26458C` | painted signs, street-sign blue, jumpsuit option |
| `sun` | `#FFC98A` | key-light colour, warm rim on edges |

### Neutrals and atmosphere
| Token | Hex | Use |
|---|---|---|
| `ink` | `#2B2A30` | text, dark details (eyes, glasses) |
| `ink-soft` | `#5E5A63` | secondary text |
| `shadow` | `#6E6C86` | shadow tint: cool lavender-grey, never black (measured `#656F74`, `#8B7A90` at dusk) |
| `sky-top` | `#86C2DC` | high-altitude sky (slightly desaturated from the old `#7EC8E3`) |
| `sky-bottom` | `#F4CFA4` | horizon peach |
| `dusk` | `#C9A3B6` | optional landing-time sky tint (reference 5 has a pink-violet dusk) |
| `cloud` | `#FFF6EC` | clouds |

### Skin tones (for jumpers; vary them across the crowd)
`#E8BE96` · `#CE9F7B` · `#B57257` · `#A1634D`

### Rules
- Large areas are **warm cream, terrazzo, sage, grass**; saturated colour lives in **small objects**
  (chairs, canopies, signs). If a whole surface is saturated, it's wrong.
- Everything is **slightly desaturated and warm-graded** compared with raw KayKit colours. KayKit's
  atlas is a touch too candy; we warm-grade it (see §8).

---

## 3. Lighting

- **Key light:** one directional sun, **low (≈25–35° elevation)**, warm (`#FFC98A`–`#FFD2A0`),
  coming from **back-left** of the camera so faces and fronts get soft side light and shadows fall
  toward the viewer-right. Intensity high enough for crisp highlight edges on rounded tops.
- **Fill:** hemisphere light, cool sky (`#BFD9EA`) over warm ground bounce (`#E6CFAF`). Shadow sides read
  **lavender-grey**, never black.
- **Shadows:** soft-edged and **long** (low sun). Every object sits in a contact shadow.
- **Ambient occlusion:** strong in corners, under tables, where walls meet floors. This is a big part
  of the "rendered toy" feel. Use SSAO (N8AO) at runtime; bake AO for static dioramas later.
- **Bloom:** gentle, only on bright things (sun glints, steam, window light, light bulbs).
- **Time of day:** golden-hour daylight for the jump; the dropzone may drift toward a pink-violet dusk
  at the very end (optional).

## 4. Materials

- `meshStandardMaterial` (or `meshPhysicalMaterial` sparingly): **roughness 0.6–0.9, metalness 0**.
  Plastic chairs and tiles can drop to 0.45 for a soft sheen. **No toon ramp, no outlines.**
- **Smooth shading on round things**; flat shading only on intentionally faceted rocks.
- Patterns (terrazzo, floor tiles, roof tiles) are **very subtle**: low-contrast texture or geometry,
  readable only up close.

## 5. Camera and lens

- **Perspective, low FOV (≈28–35°)** so things look like a tabletop model seen from a distance.
- Diorama views (plane, canopy, dropzone): **3/4 view looking down ≈40–50°**, slightly rotated (≈30–45° yaw).
- Freefall/top-down: per CLAUDE.md §4 (≈75–85° down).
- **Cut-away construction:** no roof and no near walls on interiors, so you look into the room like a dollhouse.
- **No blur at all (owner decision, 2026-11-19):** the references use heavy tilt-shift, but the owner
  finds any blur ugly. Everything stays sharp; the miniature feel comes from the low FOV, soft light and AO.
  Light vignette only.

## 6. Characters

- **≈2.5–3 heads tall.** The head is a big smooth sphere (≈40–45% of total height).
- **Faces are tiny and simple:** two small dark dot or short-line eyes, an optional tiny mouth line,
  often **glasses** (thin dark or white frames). No blush, no nose, no outlines.
- Hair is a simple cap/shell or absent; varied skin tones.
- Bodies are **pill/cylinder torsos**, short stubby straight arms with **mitten hands**, short legs,
  simple footwear. Clothing is flat colour blocks (singlets, aprons, shorts); jumpsuits for us.
- Pose language is **stiff and toy-like**, with little bobs, hops and arm waves rather than fluid animation.
- Our skydivers add: rounded helmet shell, goggles, a rig/container on the back, bright jumpsuit.

## 7. Prop density and storytelling

- **Very dense.** Every counter, shelf and corner is filled with readable mini props: jars, cups,
  bottles, crates, plants in pots, fans, wall signs, calendars, a cat figurine, gas cylinders.
- Props are **slightly oversized** relative to characters so they read at site scale.
- Each diorama tells a small story at a glance (busy market stall, office with a flipping calendar, etc.).
- Ground is rarely blank: pavement tiles, kerbs, potted plants, little flower beds, street furniture.

## 8. Asset styling (KayKit as the house style)

- KayKit models already match: rounded, chunky, smooth-shaded, one gradient atlas texture.
- **Warm-grade every KayKit atlas** with the same small colour transform (warmer white balance, −10–15%
  saturation, lifted blacks) so they sit in our palette. Our graded atlas = `design/palette.png`.
- **Kenney / Quaternius** models use flat material colours: re-colour each material to the nearest
  palette token above. Never place two authors' versions of the same kind of object in one scene.
- Code-built things (jumpers, plane, canopy, clouds, hangar shell) use the **same palette and materials**
  so nothing looks out of place next to KayKit.

## 9. UI (HTML overlay)

What the references show for the *game HUD* (we design our own, never copy theirs):
- **Cream/white rounded panels** (`paper`/`cream`, radius ≈16–20px) with **no heavy border** and a
  soft drop shadow; a **pill-shaped** top status bar.
- Grid of **rounded-square tiles** on a slightly darker cream for choices.
- **Circular icon buttons:** primary is red (`canopy-red`) with a white icon; secondary is a muted grey-cream.
- Bold, rounded, friendly sans text in dark `ink`; small all-caps labels.
- Icons are simple, colourful and chunky.

**In-world signage** (part of the 3D scene, not the HUD) is where painted signboards belong: red boards
with white/yellow lettering, navy boards with a white border, cream boards with red lettering, all
rendered as real HTML labels pinned in the world (for accessibility), styled like painted shop signs.

> Note: the current build uses wooden-plank signboards for the HUD (picked in the Q&A). The
> references point to **clean cream rounded panels for the HUD** with painted signs only *in-world*.
> Recommended: switch HUD/panels to cream cards and keep the painted-sign style for in-world labels.
> Pending the owner's call.

## 10. Comparison checklist (after building each zone)

Screenshot the zone and compare against the references; note anything that's:
- [ ] too dark / shadows too black (should be lavender-grey)
- [ ] too saturated over large areas (saturation belongs in small props)
- [ ] too clean/empty (needs more storytelling props)
- [ ] outlined or cel-shaded (should be soft-lit, smooth)
- [ ] any blur at all (none allowed: no tilt-shift, no DOF)
- [ ] wrong angle (diorama 40–50° down; top-down 75–85°)
- [ ] characters off-model (head too small, face too detailed, fingers, blush)
