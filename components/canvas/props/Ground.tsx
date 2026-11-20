"use client";

import { Instance, Instances } from "@react-three/drei";
import { palette } from "@/lib/theme";
import { mulberry32 } from "./CloudField";
import { distanceHaze, distanceHazeKey } from "./distanceHaze";
import { settings } from "@/content";
import { HdbEstate, HDB_CELLS } from "./HdbEstate";
import { Kit, preloadKit, type KitName } from "./Kit";

const BUILDINGS: KitName[] = [
  "city/building_A",
  "city/building_B",
  "city/building_C",
  "city/building_E",
  "city/building_F",
  "city/building_G",
];
preloadKit(BUILDINGS);

/** [x, z, radius] */
const PONDS: [number, number, number][] = [
  [-40, 22, 4.5],
  [31, 38, 3.2],
  [-58, -47, 5.5],
  [62, 14, 3.8],
];

/**
 * The ground far below (CLAUDE.md §4: "visible the whole time … a tiny patchwork of fields").
 * Deterministic so server and client agree. Code-built placeholders; KayKit town blocks and
 * Kenney crop rows replace the boxes in the asset pass (design/ASSETS.md).
 */

const CELL = 9;
const HALF = 10; // cells each side of centre → 180 × 180 units of fields
/** Keep the middle clear for the dropzone diorama. */
const CLEAR_RADIUS = 15;

const FIELD_COLORS = [
  palette.grass,
  palette.grassLit,
  "#97A458", // olive
  "#CDB377", // wheat
  "#B58C62", // ploughed earth
  "#6F8A40", // deep pasture
] as const;

const ROADS_X = [-3 * CELL, 4 * CELL];
const ROADS_Z = [-2 * CELL, 5 * CELL];

interface Field {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}
interface Clump {
  position: [number, number, number];
  scale: number;
  color: string;
}
interface House {
  position: [number, number, number];
  rotation: number;
  scale: number;
}

function build() {
  const rand = mulberry32(4242);
  const fields: Field[] = [];
  const trees: Clump[] = [];
  const houses: House[] = [];

  for (let i = -HALF; i < HALF; i++) {
    for (let j = -HALF; j < HALF; j++) {
      const cx = (i + 0.5) * CELL;
      const cz = (j + 0.5) * CELL;
      if (Math.hypot(cx, cz) < CLEAR_RADIUS) continue;
      // Room for the HDB estate (settings.singaporeTouch).
      if (
        settings.singaporeTouch &&
        i >= HDB_CELLS.i[0] &&
        i <= HDB_CELLS.i[1] &&
        j >= HDB_CELLS.j[0] &&
        j <= HDB_CELLS.j[1]
      )
        continue;
      // Town quarter: a cluster of houses instead of fields.
      if (i >= 2 && i <= 4 && j >= -5 && j <= -3) {
        for (let h = 0; h < 2; h++) {
          houses.push({
            position: [cx + (h === 0 ? -2 : 2), 0, cz + (rand() - 0.5) * 3],
            rotation: Math.floor(rand() * 4) * (Math.PI / 2),
            scale: 0.85 + rand() * 0.35,
          });
        }
        continue;
      }
      if (rand() < 0.14) continue; // plain grass between fields
      // Fields are slightly irregular so the patchwork doesn't look like graph paper.
      const w = CELL - 1.2 - rand() * 1.4;
      const d = CELL - 1.2 - rand() * 1.4;
      fields.push({
        position: [cx + (rand() - 0.5) * 0.6, 0.03, cz + (rand() - 0.5) * 0.6],
        scale: [w, 0.06, d],
        color: FIELD_COLORS[Math.floor(rand() * FIELD_COLORS.length)],
      });
      // Hedgerow trees along some field edges.
      if (rand() < 0.45) {
        const n = 2 + Math.floor(rand() * 4);
        const alongX = rand() < 0.5;
        for (let k = 0; k < n; k++) {
          const off = (k / Math.max(1, n - 1) - 0.5) * (CELL - 2);
          trees.push({
            position: alongX
              ? [cx + off, 0.8, cz + CELL / 2 - 0.3]
              : [cx + CELL / 2 - 0.3, 0.8, cz + off],
            scale: 0.7 + rand() * 0.6,
            color: rand() < 0.6 ? palette.foliageDeep : "#5C7536",
          });
        }
      }
    }
  }
  return { fields, trees, houses };
}

const { fields: FIELDS, trees: TREES, houses: HOUSES } = build();

export function Ground() {
  return (
    <group>
      {/* base grass, wide enough to fill the view from 13,000 ft */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[320, 64]} />
        <meshStandardMaterial
          color={palette.grass}
          roughness={1}
          onBeforeCompile={distanceHaze}
          customProgramCacheKey={distanceHazeKey}
        />
      </mesh>

      <Instances limit={FIELDS.length} range={FIELDS.length} receiveShadow>
        <boxGeometry />
        <meshStandardMaterial
          roughness={1}
          onBeforeCompile={distanceHaze}
          customProgramCacheKey={distanceHazeKey}
        />
        {FIELDS.map((f, i) => (
          <Instance key={i} position={f.position} scale={f.scale} color={f.color} />
        ))}
      </Instances>

      {/* country roads */}
      {ROADS_X.map((x) => (
        <mesh key={`x${x}`} position={[x, 0.05, 0]} receiveShadow>
          <boxGeometry args={[1.6, 0.04, HALF * CELL * 2]} />
          <meshStandardMaterial
            color={palette.terrazzo}
            roughness={0.95}
            onBeforeCompile={distanceHaze}
            customProgramCacheKey={distanceHazeKey}
          />
        </mesh>
      ))}
      {ROADS_Z.map((z) => (
        <mesh key={`z${z}`} position={[0, 0.06, z]} receiveShadow>
          <boxGeometry args={[HALF * CELL * 2, 0.04, 1.6]} />
          <meshStandardMaterial
            color={palette.terrazzo}
            roughness={0.95}
            onBeforeCompile={distanceHaze}
            customProgramCacheKey={distanceHazeKey}
          />
        </mesh>
      ))}

      <Instances limit={TREES.length} range={TREES.length} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial
          roughness={0.9}
          onBeforeCompile={distanceHaze}
          customProgramCacheKey={distanceHazeKey}
        />
        {TREES.map((t, i) => (
          <Instance key={i} position={t.position} scale={t.scale} color={t.color} />
        ))}
      </Instances>

      {/* tiny town: KayKit buildings (cloned; they share geometry and materials) */}
      {HOUSES.map((h, i) => (
        <Kit
          key={i}
          name={BUILDINGS[i % BUILDINGS.length]}
          position={h.position}
          rotation={[0, h.rotation, 0]}
          scale={1.5 * h.scale}
        />
      ))}

      {settings.singaporeTouch && <HdbEstate />}

      {/* a few ponds so the patchwork isn't only fields */}
      {PONDS.map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.08, z]} receiveShadow>
          <circleGeometry args={[r, 28]} />
          <meshStandardMaterial
            color="#8DB9C9"
            roughness={0.5}
            onBeforeCompile={distanceHaze}
            customProgramCacheKey={distanceHazeKey}
          />
        </mesh>
      ))}
    </group>
  );
}
