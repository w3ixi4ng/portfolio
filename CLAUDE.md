# CLAUDE.md — Skydiving Portfolio ("Tiny Freefall")

This file tells Claude Code how to build and maintain this project. Read it fully before making changes.

---

## 1. Project overview

A **developer/design portfolio** presented as an interactive, cozy, tiny-world skydive.
The visitor _scrolls to fall_: they exit a little plane at 13,000 ft and freefall past
floating "islands" of content (about, skills, projects, experience) before deploying a
canopy and landing on a tiny dropzone where the contact section lives.

Skydiving is the **theme**, not the subject. The goal is that a recruiter or client leaves
knowing: who I am, what I build, how good the work is, and how to contact me, in under
60 seconds, while remembering the site because it was charming.

**Visual inspiration:** _Tiny Kopitiam_ (cozy isometric management sim): cute, warm,
miniature 3D diorama worlds, small expressive characters, satisfying little details,
gentle humour. Capture that _feeling_; **never copy its assets, characters, logo, or UI.**
All art must be original.

---

## 2. Tech stack

| Layer       | Choice                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Framework   | **Next.js (App Router)**, TypeScript, `strict: true`                                                             |
| 3D          | **React Three Fiber** (`@react-three/fiber`) + **drei** (`@react-three/drei`)                                    |
| Scroll ↔ 3D | drei `ScrollControls` / `useScroll` (preferred) or GSAP ScrollTrigger if needed                                  |
| Animation   | `@react-spring/three` or `maath/easing` for 3D; **Framer Motion** for DOM UI                                     |
| Post FX     | `@react-three/postprocessing` (subtle only: ambient occlusion, bloom, vignette). **No blur, tilt-shift or DOF.** |
| Styling     | **Tailwind CSS** for HTML overlay UI                                                                             |
| State       | **Zustand** (scroll phase, sound on/off, easter-egg flags, quality tier)                                         |
| Audio       | Howler.js (optional, **muted by default**)                                                                       |
| Content     | **One file**: `content/portfolio.json`, validated by **Zod**; edited via a dev-only `/admin` page (see §7)       |
| Lint/format | ESLint + Prettier                                                                                                |
| Deploy      | Vercel                                                                                                           |

Package manager: **pnpm**.

### Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck    # tsc --noEmit
```

Run `pnpm lint && pnpm typecheck` before considering a task done.

---

## 3. Design language: "cozy miniature"

### Look

- **Miniature / diorama feel**: low-poly, rounded, chunky shapes; slightly toy-like proportions.
  The low-FOV camera and soft lighting sell the "tiny world" effect. **No blur of any kind** (no tilt-shift, no DOF).
- **Soft lighting**: warm key light (golden hour), cool fill, soft shadows (`<ContactShadows>`,
  baked AO where possible). No harsh black shadows.
- **Materials**: matte `meshStandardMaterial` / toon-ish shading, low roughness variance.
  Flat colours with gentle gradients, no photoreal textures.
- **Characters**: tiny chibi skydivers (big head, small body, ~3 heads tall) in colourful
  jumpsuits, goggles and helmets. Idle animations: wiggle, wave, little bob.

### Reference images (READ BEFORE ANY VISUAL WORK)

- `design/references/` holds screenshots I saved from the Tiny Kopitiam Steam page/trailer, plus other
  cozy-diorama references. **Open and look at them before building or restyling any 3D scene or UI.**
- `design/references/` is in `.gitignore`: the screenshots are someone else's copyrighted art, used only
  as mood references. Never ship them, trace them, sample them into textures, or recreate a specific scene.
- On first setup, look at the references and write `design/STYLE.md`: the palette you see (hex values),
  lighting direction/temperature, shadow softness, outline yes/no, character proportions, prop density, UI shapes.
  Then update the palette below and `lib/theme.ts` to match. `STYLE.md` wins over this file on visual details.
- After building a zone, take a screenshot of it, compare it side-by-side with the references, and list
  what's off (too dark, too detailed, too saturated, wrong angle) before calling it done.

### Diorama style rules

- **Camera:** see "Camera: top-down view" in §4 for the freefall view. Low-FOV perspective (~30–35°) throughout,
  so objects look like miniatures. For the plane, canopy flight and dropzone, use the classic diorama 3/4 view
  (looking down ~35–45°) and frame scenes like a tabletop model.
- **Shapes:** chunky and simple, bevelled/rounded edges, slightly exaggerated proportions
  (fat chairs, big doors, oversized props). Low poly but not faceted-sharp. Smooth shading on round things.
- **Colour:** flat colours from a **small shared palette texture** (one atlas PNG, UVs point at colour swatches)
  instead of detailed textures. This keeps every asset consistent. Warm, slightly desaturated pastels, not neon.
- **Lighting:** one warm directional sun + cool hemisphere fill; soft shadows; ambient occlusion in corners.
  Bake lighting/AO in Blender for static scenes (dropzone, islands) for the "rendered toy" look.
- **Density:** each diorama is packed with tiny storytelling props (mugs, crates, plants, signs, laundry),
  but nothing smaller than what's readable at site scale.
- **Characters:** ~3 heads tall, simple dot eyes, no fingers (mitten hands), bouncy squash-and-stretch idles.
- **Post:** ambient occlusion + gentle vignette + slight bloom on bright sky. **No blur / tilt-shift / DOF.** No heavy effects.

### Asset sources (original or CC0 only)

Workflow: **block out with primitives → kitbash free CC0 packs → recolour to our palette atlas →
(optional) bake lighting in Blender → export `.glb` → `npx gltfjsx --transform --types`.**
Approved packs (all CC0, free tiers). Raw downloads go in `design/asset-packs/` (gitignored);
only the models actually used get optimised into `public/models/`.

**KayKit: the main style (match everything else to it).** One shared gradient atlas texture, glTF included.

- Furniture Bits: https://kaylousberg.itch.io/furniture-bits (hangar/office interiors on islands)
- Restaurant Bits: https://kaylousberg.itch.io/restaurant-bits (kopi stall at the dropzone, tables, cups)
- City Builder Bits: https://kaylousberg.itch.io/city-builder-bits (ground patchwork seen from above, island buildings)
- Resource Bits: https://kaylousberg.itch.io/resource-bits (crates, barrels, clutter props)

**Quaternius**

- Stylized Nature MegaKit: https://quaternius.com/packs/stylizednaturemegakit.html (trees/rocks/grass; has glTF)
- Ultimate Platformer Pack: https://quaternius.com/packs/ultimateplatformer.html (animated character: use only as a
  rig/animation reference or for background jumpers, **not** as my avatar)
- Ultimate Nature Pack: https://quaternius.com/packs/ultimatenature.html (**no glTF**: FBX/OBJ/Blend only; convert via
  Blender or `fbx2gltf`, or skip it since the MegaKit covers the same ground)

**Kenney**

- Nature Kit: https://kenney.nl/assets/nature-kit
- Furniture Kit: https://kenney.nl/assets/furniture-kit
- Food Kit: https://kenney.nl/assets/food-kit (snacks/kopi for the Singapore touch, if enabled)

**Not covered by any pack, so build in code (or Blender later):** my avatar + skydivers, plane, parachute canopies,
clouds, windsock, hangar shell, altimeter. These are simple shapes and must match the KayKit look.

**Mixing styles:** the three authors shade differently (KayKit gradient atlas vs Kenney/Quaternius flat colours).
Recolour everything to our palette, and don't put two authors' versions of the same thing (e.g. two tree styles) in one scene.

- **Poly Pizza** (poly.pizza): mostly CC-BY. Allowed, but **record every credit in `public/models/CREDITS.md`** and show it in a site footer.
- **Not allowed:** ripped game assets, Sketchfab models without checking licence, anything from Tiny Kopitiam.
- Re-colour every imported asset to our palette so packs from different authors look like one world.

### Palette (CSS variables in `app/globals.css`, mirrored in `lib/theme.ts`; measured from the references, full table in `design/STYLE.md` §2)

```
--sky-top:      #86C2DC   /* high-altitude blue */
--sky-bottom:   #F4CFA4   /* warm horizon peach */
--cloud:        #FFF6EC
--canopy-red:   #D0402C   /* accents: small objects only */
--canopy-yellow:#E6B04E   /* mustard */
--canopy-teal:  #4E9C8F   /* muted teal */
--sign-navy:    #26458C
--cream:        #F2EBD9   /* walls, large light surfaces */
--terrazzo:     #D3CFC4   /* floors, pavement */
--terracotta:   #B4644A   /* roofs, brick */
--sage:         #A3BCA6   /* painted timber */
--grass:        #7E9645
--earth:        #9A6B4C
--shadow:       #6E6C86   /* shadow tint: lavender-grey, never black */
--ink:          #2B2A30   /* text */
--paper:        #FBF7EE   /* UI panels */
```

Sky gradient shifts with altitude: deep blue at 13k ft → warm peach near the ground.

### Typography

- Display: a rounded, friendly font (e.g. **Fredoka** or **Baloo 2**) via `next/font`.
- Body: a clean readable sans (e.g. **Nunito** or **Inter**).
- No more than 2 font families.

### UI chrome (HTML overlay)

- Panels look like **cozy game UI**: rounded corners (`rounded-2xl`), thick soft borders,
  paper background, small drop shadow, slight "pop" spring on open.
- Buttons feel tactile: press-down scale (0.95), soft click sound if audio on.
- Iconography: simple, chunky, hand-drawn-feeling SVGs.

---

## 4. Experience structure: the jump

Scroll progress `0 → 1` maps to altitude `13,000 ft → 0 ft`. Each section is a "zone".

| Scroll    | Altitude        | Zone                | Content                                                                                                                                                                                                 |
| --------- | --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.00–0.10 | 13,000 ft       | **The Plane**       | Hero: name, title, one-line pitch. Tiny plane interior, door opens, jumpers fist-bump. CTA: "Scroll to jump ↓"                                                                                          |
| 0.10–0.30 | 12,000–9,000 ft | **Exit & Freefall** | **About me**. Camera swings overhead into the top-down view; my avatar falls belly-to-earth, the ground a tiny patchwork far below; bio on a cloud card beside me                                       |
| 0.30–0.50 | 9,000–6,000 ft  | **Formation**       | **Skills**. Seen from above, other tiny jumpers fly in and link hands in a ring/star around me, each holding a skill badge (grouped: Languages / Frameworks / Infra & DevOps / Cloud)                   |
| 0.50–0.75 | 6,000–3,000 ft  | **Sky Islands**     | **Projects**. Floating mini-diorama islands rise up from below and drift past on either side of me (top-down, so you look down onto their rooftops); click to open a project panel                      |
| 0.75–0.85 | 3,000 ft        | **Deployment**      | Canopy pops open (satisfying spring + sound); camera eases out of top-down into a 3/4 chase view so the canopy doesn't hide me. **Experience** timeline shown as waypoints along the canopy flight path |
| 0.85–1.00 | 1,000–0 ft      | **The Dropzone**    | Landing flare, little dust puff. **Contact**: hangar, windsock, packing mat. Email/socials/resume as objects on the ground                                                                              |

### Camera: top-down view (core look of the site)

From exit to deployment (scroll ~0.12–0.78) the camera sits **above my avatar looking down** at it,
like a camera-flyer directly overhead, and falls with me.

- **Angle:** mostly overhead (~75–85° down), not perfectly 90°. A slight tilt keeps depth, lets props show
  their sides, and stops it looking flat. The avatar stays roughly centred, a bit above screen centre.
- **Sense of falling, seen from above:**
  - The **ground diorama is visible the whole time**, far below: it starts as a tiny patchwork of fields
    and grows bigger as altitude drops. This is the main altitude cue.
  - **Clouds** come up from below, pass around/through the view and fade out at the camera (soft alpha, no hard pop).
  - Light **speed lines/wind particles** stream past toward the camera; the avatar's suit flutters.
  - Islands and formation jumpers **start small below and grow** as I fall toward their level, then pass beside me.
- **Avatar from above shows its back**, so make it readable: bright jumpsuit and helmet with a clear top
  design (e.g. a big star or my initials "WX"), and every few seconds it **turns its head up to the camera
  and waves/grins** so visitors see its face.
- **Layout from above:** the avatar takes the centre; content cards sit to the left/right of it on desktop,
  and below it on mobile (portrait suits top-down well: the fall is vertical on screen).
- **Gentle motion:** slow bobbing and slight drift/rotation (a few degrees max) so it feels alive, not static.
  Reduced motion → no drift, no particles.
- **Transitions:** plane interior (3/4 view) → exit → camera swings overhead within the first ~0.05 of scroll.
  At deployment it eases back out to a 3/4 chase view, then to the dropzone diorama view for landing.

### Persistent HUD

- **Altimeter** (bottom-left, wrist-mounted style): shows current altitude, doubles as
  **navigation**. Click a zone marker to smooth-scroll there.
- Sound toggle (top-right, default **off**).
- "Skip the jump" link → jumps to a plain, accessible content view (see §8).

### Section rules

- Every zone must make sense **without** the 3D (text is real HTML, not baked into textures).
- Camera moves are **eased and slow**. No sudden cuts, no spinning beyond a gentle roll.
- Content cards fade/spring in as their zone enters and fade out as it leaves.

---

## 5. Humour & easter eggs (cozy + funny)

Keep them small, discoverable, never blocking content. Track found eggs in Zustand and show
a tiny "🪂 3/6 found" counter in the HUD once the first one is found.

Ideas (implement progressively):

1. **Click a fellow jumper** in freefall → they do a little backflip / thumbs-up.
2. **A pigeon** at 8,000 ft looks deeply confused. Click it → "coo?" bubble.
3. ~~Camera-flyer selfie~~ (removed: owner did not want it, so there are no fun facts either).
4. **Windsock** at the dropzone: hover/click → spins and flaps wildly.
5. **Packer on the mat** is asleep on a pile of canopy; poke them → startled "I'M UP" bubble.
6. **Line twists** at deployment: rare (1 in 10) chance the avatar spins comically before steadying.
7. ~~Konami code → party hats~~ (removed: owner did not want it).
8. ~~Scroll back up after landing → ladder~~ (removed: owner found it annoying).
9. **Reserve pop**: click me under canopy → the main is cut away, flutters off, and an orange-and-white reserve snaps open: "Cutaway! Main gone, reserve open ✅" (shown as the procedure working, owner-requested; keep it cheerful, no danger).

Tone: wholesome, self-aware, never mocking safety. No dangerous-looking malfunctions or gore.

---

## 6. Project structure

```
app/
  layout.tsx            # fonts, metadata, providers
  page.tsx              # mounts <Experience/> + <Overlay/>
  plain/page.tsx        # accessible no-3D version of all content
  globals.css
components/
  canvas/
    Experience.tsx      # <Canvas>, ScrollControls, lights, post FX
    Sky.tsx             # altitude-driven gradient + clouds
    CameraRig.tsx       # scroll → camera path (CatmullRomCurve3)
    zones/
      PlaneZone.tsx
      FreefallZone.tsx
      FormationZone.tsx
      IslandsZone.tsx
      DeploymentZone.tsx
      DropzoneZone.tsx
    characters/
      Jumper.tsx        # reusable chibi skydiver (props: suit colour, pose, idle anim)
      Avatar.tsx        # "me"
    props/              # Plane, Cloud, Island, Canopy, Windsock, Hangar...
  ui/
    Overlay.tsx         # HTML layer synced to scroll
    Altimeter.tsx
    Panel.tsx           # cozy game-style modal
    ProjectCard.tsx
    SoundToggle.tsx
  admin/page.tsx        # dev-only details editor (see §7)
  api/admin/route.ts    # dev-only GET/PUT for portfolio.json
content/
  portfolio.json        # ⭐ ALL my details live here: the only file I edit
  schema.ts             # Zod schema + inferred TS types
  index.ts              # loads + validates portfolio.json, exports typed data
lib/
  store.ts              # Zustand
  theme.ts
  scroll.ts             # zone ranges + helpers (altitudeFromScroll, zoneFromScroll)
  quality.ts            # device capability → quality tier
public/
  models/               # .glb (Draco/meshopt compressed)
  textures/
  sounds/
design/
  references/           # mood screenshots (gitignored, never shipped)
  asset-packs/          # raw CC0 pack downloads (gitignored)
  STYLE.md              # style notes derived from references (Claude writes this)
  palette.png           # shared colour atlas for all models
```

### Content schema (keep content out of components)

All content is in `content/portfolio.json` with this shape:
`{ profile, education[], experience[], projects[], skills[], settings }`.
Define it once in `content/schema.ts` with Zod and infer types (`z.infer`). Example of the project shape:

```ts
// content/schema.ts (shown as a TS type for readability)
export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  stack: string[];
  year: number;
  links: { live?: string; repo?: string; caseStudy?: string };
  thumbnail: string; // /public path
  islandTheme: "city" | "forest" | "beach" | "desert" | "snow"; // look of its floating island
  featured?: boolean;
};
```

Profile/skills/experience follow the same pattern. **Use clearly marked placeholder content**
(`TODO: replace`) until I supply real details; never invent fake employers or achievements.

`settings` holds site-level toggles I may want to flip without code: e.g.
`{ showResumeDownload, singaporeTouch, easterEggsEnabled, soundDefaultOn }`.

---

## 7. Editing my details (the `/admin` page)

I want **one place** to edit everything. Two ways, same file:

1. **Edit `content/portfolio.json` directly** in VS Code. Changes hot-reload in `pnpm dev`.
2. **Use `/admin` in the browser** (`http://localhost:3000/admin`) while running `pnpm dev`.

### `/admin` requirements

- **Dev-only.** The page and `api/admin` route must return 404 when `NODE_ENV === 'production'`.
  No auth, database or CMS needed, since it never ships. It writes to `content/portfolio.json` on disk;
  I commit and deploy as usual.
- Styled in the same cozy game-UI look (paper panels, rounded, chunky buttons), titled
  something like "🪂 Jump Manifest".
- Tabs: **Profile · Education · Experience · Projects · Skills · Settings**.
- Lists (experience, projects, bullets, skills) support **add, delete, reorder** (up/down buttons are fine).
- Project form includes `islandTheme` dropdown, `featured` toggle, links, and an image path field
  with a preview of the file in `/public`.
- **Validate with the same Zod schema** before saving; show field-level errors and don't write invalid data.
- **Save** writes pretty-printed JSON (2-space indent) and keeps a backup at
  `content/portfolio.backup.json` before overwriting.
- A "Preview" button opens the site in a new tab.
- Show a small banner on the page: "Local editor: changes save to portfolio.json. Commit to publish."

### Rule for Claude

Never hardcode my personal details in components, `/plain`, metadata or OG images. Always read from
`content/index.ts`. If you need a new field, add it to the schema, the JSON, **and** the `/admin` form.

---

## 8. Accessibility & fallbacks (non-negotiable)

- `prefers-reduced-motion: reduce` → disable camera sway, parallax, auto-animations; use
  simple fades; scroll still works.
- `/plain` route: full portfolio as semantic HTML, linked from the HUD and from `<noscript>`.
- All interactive 3D objects have an HTML equivalent (buttons in overlay) and are keyboard
  reachable; visible focus rings.
- Text contrast ≥ WCAG AA against panel backgrounds.
- WebGL unavailable → automatically render `/plain` content.
- Audio is never autoplayed.

---

## 9. Performance budget

- Target **60 fps desktop, 30+ fps mid-range mobile**.
- Initial JS (excl. 3D assets) < 250 KB gzipped; total 3D assets < 5 MB, lazy-load per zone.
- Models: `.glb` with Draco/meshopt; use `gltfjsx` to generate typed components.
- Use `<Instances>` for clouds, crowds, grass tufts. Reuse materials.
- `dpr={[1, 2]}`, `<AdaptiveDpr>`, `<PerformanceMonitor>` → drop post FX / shadows on low tier.
- Pause `useFrame` work for zones that are off-screen.
- Show a cute loader: tiny jumper packing a parachute with a progress bar (`useProgress`).

---

## 10. Mobile

- Scroll-to-fall must work with touch; no hover-only interactions (tap equivalents).
- Camera framing adjusts for portrait (pull back FOV / distance).
- Panels become bottom sheets on small screens.
- Altimeter shrinks to a compact pill.

---

## 11. Coding conventions

- Functional components, named exports, one component per file.
- 3D components never contain copy; they read from `/content`.
- Scroll maths lives in `lib/scroll.ts`; zones import zone ranges from there (single source of truth).
- Use `useFrame` with `delta`-based easing (`maath/easing.damp`), never per-frame `setState`.
- Avoid `any`. Props typed with interfaces.
- Commit in small steps; message format: `feat(zone): ...`, `fix(ui): ...`, `perf: ...`.
- When adding a dependency, explain why in the PR/commit message.

---

## 12. Build order (suggested milestones)

1. Scaffold Next.js + Tailwind + R3F; empty `<Canvas>` with `ScrollControls`; sky gradient tied to scroll.
2. `content/schema.ts` + `portfolio.json` (populated from §14) + `/admin` editor; then `lib/scroll.ts` zones + Altimeter HUD + HTML overlay sections reading that content.
3. Camera rig along a curve; placeholder primitives (boxes/spheres) for each zone.
4. `/plain` accessible route + reduced-motion handling.
5. Chibi `Jumper` component (primitive-built first, swap for GLB later) + avatar.
6. Zones one by one: Plane → Freefall → Formation → Islands (project panels) → Deployment → Dropzone.
7. Loader, sound (opt-in), post FX, quality tiers.
8. Easter eggs.
9. Performance pass, Lighthouse ≥ 90 on `/plain`, SEO metadata + OG image.

Prefer getting the **whole jump working end-to-end with primitives** before polishing any single zone.

---

## 13. Don'ts

- Don't use Tiny Kopitiam (or any other game's) assets, names, logos, or characters.
- Don't hide important info (name, projects, contact) behind easter eggs or 3D-only interactions.
- Don't scroll-jack so hard that the trackpad feels broken; respect native scroll speed.
- Don't autoplay sound or show motion that can't be reduced.
- Don't add heavy libraries for small effects.
- Don't hardcode personal content inside components.

---

## 14. My content (source of truth: my resume)

Use this section to fill in the initial `content/portfolio.json`. After that, **the JSON file is the source of truth**
(I'll edit it via `/admin`), so don't overwrite my edits from this section. Keep wording tight, the way it would appear on a site,
not a copy of the resume bullets. Don't add claims that aren't here.

### Profile

- **Name:** Lau Wei Xiang
- **Title (draft):** Cloud & Platform Engineer · Information Systems @ SMU
- **Pitch (draft):** "I build secure, resilient cloud platforms, and I like making infrastructure feel effortless."
- **Email:** weixiang0124@gmail.com
- **LinkedIn:** https://linkedin.com/in/lau-wei-xiang
- **GitHub:** https://github.com/w3ixi4ng
- **Resume:** `/public/resume.pdf` (downloadable from the Dropzone)
- **Do NOT publish my phone number** anywhere on the site.
- Based in Singapore.

### Education (Freefall / About zone)

- Singapore Management University: B.Sc. Information Systems, Aug 2024 – Apr 2028
- GPA 4.0/4.0 (Summa Cum Laude), SMU Merit Scholarship, SCIS Dean's List (all applicable years)

### Experience (Deployment zone: canopy-flight waypoints, newest first)

1. **GovTech (GovCloud)**: Software Engineer Intern, May 2026 – Dec 2026
   - Architected a self-hosted secrets-management platform (OpenBao) across AWS + on-prem OpenShift, HA rollout over 3 clusters via ArgoCD
   - Evaluated SPIFFE/SPIRE workload identity; recommendation shaped the security roadmap
   - Designed an OIDC-based least-privilege access-control framework, closing a cross-tenant risk
   - Drove stronger encryption standards (AES-CBC/GCM) across clusters
   - Dynamic SSH: per-project signed certificates at VM boot, replacing static keys
   - CI/CD automation for cluster/team/workload registration and server bootstrapping
2. **PCA Company Services**: Automation Engineer Intern, Dec 2025 – Jan 2026
   - New booking system (FastAPI + React) → **40% faster** bookings
   - Content pipeline (Python, Apps Script, Gemini → WordPress) → **1 → 5 articles/week**
   - Docker apps on Google Cloud Run
3. **Coders Assembly**: Mentor, Aug 2025 – Dec 2025
   - Mentored 7 first-time programmers in Python; 100% achieved A- or above

### Projects (Sky Islands zone, one island each)

1. **Bidly**: Dell Cloud Native Finalist · Project Lead · Jan–May 2026 · `featured`
   - Microservices auction platform: FastAPI, Docker, Kubernetes, ArgoCD
   - Fixed a Redis race condition under concurrent bids with atomic Lua scripts
   - Prometheus/Grafana observability; security-first CI/CD (Trivy, Semgrep)
   - Kong API Gateway rate-limiting for auction close-out spikes; RabbitMQ + Dead Letter Exchange for scheduling
   - **Island idea:** a tiny bustling market island with an auctioneer jumper banging a gavel; bid paddles pop up when clicked
2. **Platform Migration**: Dell Cloud Native Finalist · Project Lead · Jan–May 2026 · `featured`
   - Led formal evaluation of 5 infra options → multi-cloud Kubernetes so monitoring survives a provider outage
   - Kubernetes CronJob auto-provisions system access for 500+ staff after training
   - **Island idea:** two little islands joined by a rope bridge, each with its own cloud; one cloud "rains" and the monitoring tower keeps blinking happily on the other
3. **Booking System (PCA)**: FastAPI + React, 40% faster bookings
   - **Island idea:** a tiny office island with a calendar flipping pages quickly
4. **Content Automation Pipeline (PCA)**: Python, Apps Script, Gemini, WordPress
   - **Island idea:** a little printing press island shooting out newspapers

GovTech work is **experience, not a project island**. Describe it only at the level of detail in
this file; no internal names, diagrams, or screenshots.

### Skills (Formation zone)

- **Languages:** Python, Java, JavaScript, PHP, HTML, CSS, SQL, Lua
- **Frameworks:** FastAPI, Flask, React.js, Vue.js, Node.js, Tailwind CSS, Bootstrap, Pandas
- **Infra & DevOps:** Docker, Kubernetes, OpenShift, ArgoCD, RabbitMQ, Redis, Kong API Gateway, WebSocket, Prometheus, Grafana
- **Cloud:** AWS, Azure, Google Cloud

### Theme fit

I'm an infra/platform engineer, so lean into it lightly: e.g. the dropzone hangar can be labelled
"Hangar-01 (HA)". Keep it subtle. (The altimeter's "cluster health" line was removed at the owner's request.)

---

## 15. Still needed from me (use placeholders + `TODO` until provided)

- Project links (live demos / GitHub repos) and screenshots for each project
- A photo or description of me for styling the avatar (hair, glasses, favourite colour for the jumpsuit)
- Whether to add a light Singapore touch (tiny kopi stall at the dropzone, skyline on the horizon)
- Custom domain
