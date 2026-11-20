"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { palette } from "@/lib/theme";
import { Glow } from "../Glow";
import { Matte } from "../Matte";
import { Canopy } from "./Canopy";
import { mulberry32 } from "./CloudField";
import { distanceHaze, distanceHazeKey } from "./distanceHaze";
import { Kit, preloadKit, type KitName } from "./Kit";

/**
 * Life around the airfield, outside the tree ring (the camera looks from +x,+z toward -x,-z,
 * so screen-right is +x,-z and screen-left is -x,+z):
 *  - a little farm on the right: crop rows, a red barn, a silo, hay bales, windmills behind
 *  - a jumpers' campsite on the left: tents in canopy colours, a campfire, bedrolls, a camper van (Kenney Survival/Car kits)
 *  - sky life over the dropzone: two canopy pilots spiralling down, the jump plane circling
 *    back up, and a few birds
 */

const rand = mulberry32(777);

/** World XZ from a bearing (degrees, 0 = +x, 90 = +z) and a distance from the plaza. */
const P = (deg: number, r: number): [number, number] => [
  Math.cos((deg * Math.PI) / 180) * r,
  Math.sin((deg * Math.PI) / 180) * r,
];
/** The farm sits behind Hangar 03/02 (bearing ~205°), the camp behind 02/01 (~262°). */
const FARM_C = P(205, 25);

/**
 * Ground footprints [x, z, radius] of everything placed here, so the tree ring and the
 * hedgerows can keep clear of them (and only of them: the rest stays wooded).
 */
export const FOOTPRINTS: [number, number, number][] = [
  [FARM_C[0], FARM_C[1], 7.2], // crop field
  [...P(214, 30), 4.2], // barn + silo
  [...P(201, 19.2), 2], // tractor
  [...P(222, 27), 2.4], // flatbed
  [...P(198, 21), 1.8], // bales
  [...P(207, 33.5), 1.6], // windmills
  [...P(219, 34), 1.6],
  [...P(254, 23.5), 1.8], // tents
  [...P(263, 26), 1.8],
  [...P(272, 23.5), 1.8],
  [...P(263, 22), 2.2], // campfire + bedrolls
  [...P(246, 19.5), 1], // signpost
  [...P(250, 20.5), 1.4], // picnic blanket
  [...P(281, 23), 1.6], // barrels + box
  [...P(278, 26.5), 2.4], // van
];
/** A little village of KayKit houses (bearing ~300-335 deg and ~95-120 deg). */
const VILLAGE: [KitName, number, number, number][] = [
  ["city/building_A", ...P(302, 27), 0.4],
  ["city/building_C", ...P(309, 31), 1.1],
  ["city/building_B", ...P(316, 27.5), -0.3],
  ["city/building_E", ...P(323, 31.5), 0.8],
  ["city/building_D", ...P(331, 28), 0.2],
  ["city/building_G", ...P(96, 30), -0.6],
  ["city/building_H", ...P(104, 34), 0.3],
  ["city/building_F", ...P(112, 30.5), 1.4],
  ["city/building_A", ...P(120, 34.5), -0.2],
];
FOOTPRINTS.push(...VILLAGE.map(([, x, z]): [number, number, number] => [x, z, 2.8]));

export const inFootprint = (x: number, z: number, pad = 0) =>
  FOOTPRINTS.some(([fx, fz, r]) => Math.hypot(x - fx, z - fz) < r + pad);

/* ------------------------------------------------------------------ farm (right) */

const CROPS: [KitName, number, number][] = [];
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    CROPS.push([
      row < 3 ? "kenney/crops_wheatStageB" : "kenney/crops_cornStageC",
      FARM_C[0] - 4.5 + col * 1.45 + (rand() - 0.5) * 0.2,
      FARM_C[1] - 3.2 + row * 1.3,
    ]);
  }
}
/** Two windmills standing in a neat row just behind the barn, facing the camera. */
const WINDMILLS: [number, number, number][] = [
  [...P(207, 33.5), (3 * Math.PI) / 4],
  [...P(219, 34), (3 * Math.PI) / 4],
];
const BALES: [number, number, number][] = [
  [...P(198, 20.5), 0.2],
  [...P(201, 21.3), 1.2],
  [...P(196, 21.8), -0.5],
];

function Barn() {
  return (
    <group position={[P(214, 30)[0], 0, P(214, 30)[1]]} rotation={[0, 0.9, 0]}>
      <RoundedBox args={[3.2, 2.2, 2.6]} position={[0, 1.1, 0]} radius={0.08} castShadow>
        <Matte color="#B9483A" />
      </RoundedBox>
      {/* gable roof: a triangular prism */}
      <mesh position={[0, 2.62, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 3.4, 3, 1, false, Math.PI / 2]} />
        <Matte color={palette.cream} />
      </mesh>
      {/* big white-trimmed door */}
      <mesh position={[1.61, 0.85, 0]}>
        <boxGeometry args={[0.04, 1.6, 1.3]} />
        <Matte color="#8E3328" />
      </mesh>
      {[-1, 1].map((d) => (
        <mesh key={d} position={[1.64, 0.85, 0]} rotation={[d * 0.9, 0, 0]}>
          <boxGeometry args={[0.03, 1.9, 0.08]} />
          <Matte color={palette.paper} />
        </mesh>
      ))}
      {/* silo */}
      <mesh position={[-0.6, 2.0, -2.2]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 4, 18]} />
        <Matte color={palette.cream} />
      </mesh>
      <mesh position={[-0.6, 4.0, -2.2]} castShadow>
        <sphereGeometry args={[0.78, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Matte color={palette.terracotta} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ camp (left) */

const TENTS: [number, number, number, string][] = [
  [...P(254, 23.5), 0.4, palette.canopyRed],
  [...P(263, 26), -0.3, palette.canopyYellow],
  [...P(272, 23.5), 1.1, palette.canopyTeal],
];

function Tent({ color }: { color: string }) {
  return (
    <group>
      {/* A-frame: a triangular prism lying on its side */}
      <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 1.9, 3]} />
        <Matte color={color} />
      </mesh>
      <mesh position={[0, 0.3, 0.96]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.38, 3, Math.PI / 2]} />
        <Matte color="#3E3540" />
      </mesh>
    </group>
  );
}

function Camp() {
  return (
    <group>
      {TENTS.map(([x, z, r, c]) => (
        <group key={`${x},${z}`} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Tent color={c} />
        </group>
      ))}
      {/* campfire (Kenney Survival Kit) with a flame that glows at night, bedrolls round it */}
      <group position={[P(263, 22)[0], 0, P(263, 22)[1]]}>
        <Kit name="survival/campfire-pit" scale={1.6} />
        <mesh position={[0, 0.45, 0]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <Glow color="#FFB347" emissive="#FF7A1F" off={0.6} on={3.2} />
        </mesh>
        <Kit name="survival/bedroll" position={[1.3, 0, 0.4]} rotation={[0, 1.2, 0]} scale={1.6} />
        <Kit
          name="survival/bedroll"
          position={[-1.2, 0, 0.6]}
          rotation={[0, -1.0, 0]}
          scale={1.6}
        />
      </group>
      {/* camp signpost, barrels and a supply box */}
      <Kit
        name="survival/signpost"
        position={[P(246, 19.5)[0], 0, P(246, 19.5)[1]]}
        rotation={[0, 0.6, 0]}
        scale={1.8}
      />
      <Kit name="survival/barrel" position={[P(281, 22.5)[0], 0, P(281, 22.5)[1]]} scale={1.6} />
      <Kit
        name="survival/barrel"
        position={[P(283, 23.3)[0], 0, P(283, 23.3)[1]]}
        rotation={[0, 0.7, 0]}
        scale={1.6}
      />
      <Kit
        name="survival/box"
        position={[P(279, 23.6)[0], 0, P(279, 23.6)[1]]}
        rotation={[0, 0.3, 0]}
        scale={1.6}
      />
      {/* picnic blanket with two mugs */}
      <group position={[P(250, 20.5)[0], 0.08, P(250, 20.5)[1]]} rotation={[0, 0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[1.6, 0.03, 1.2]} />
          <Matte color={palette.paper} />
        </mesh>
        {[-0.5, 0, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.02, 0]}>
            <boxGeometry args={[0.25, 0.01, 1.2]} />
            <Matte color={palette.canopyRed} />
          </mesh>
        ))}
        <Kit name="kenney/mug" position={[0.3, 0.02, 0.2]} scale={1.2} />
        <Kit name="kenney/mug" position={[-0.2, 0.02, -0.3]} scale={1.2} />
      </group>
      {/* a camper car with a canopy bag on the roof */}
      <group position={[P(278, 26.5)[0], 0, P(278, 26.5)[1]]} rotation={[0, 0.2, 0]}>
        <Kit name="car/van" scale={1.2} />
        <RoundedBox args={[0.9, 0.3, 0.6]} position={[0, 1.2, 0]} radius={0.1}>
          <Matte color={palette.canopyYellow} />
        </RoundedBox>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ woods */

const WOOD_KINDS: KitName[] = [
  "nature/tree_oak",
  "nature/plant_bushLarge",
  "nature/tree_default",
  "nature/tree_fat",
  "nature/tree_pineRoundA",
  "nature/plant_bush",
  "nature/tree_detailed",
  "nature/plant_bushLarge",
];
/** Clumps of trees filling the open ground behind the hangars (the finale's middle distance). */
const WOODS: [KitName, number, number, number, number][] = (() => {
  const r = mulberry32(919);
  const out: [KitName, number, number, number, number][] = [];
  for (let i = 0; i < 110; i++) {
    const deg = 150 + r() * 150;
    const dist = 27 + r() * 14;
    const [x, z] = P(deg, dist);
    if (inFootprint(x, z, 1.8)) continue;
    if (out.some(([, ox, oz]) => Math.hypot(ox - x, oz - z) < 2)) continue;
    const kind = WOOD_KINDS[i % WOOD_KINDS.length];
    // bushes get bigger so they read from the dropzone
    const sc = kind.includes("plant_bush") ? 3.2 + r() * 1.4 : 2.6 + r() * 1.2;
    out.push([kind, x, z, r() * Math.PI * 2, sc]);
  }
  return out;
})();
FOOTPRINTS.push(...WOODS.map(([, x, z]): [number, number, number] => [x, z, 1.6]));

/* ------------------------------------------------------------------ hills */

/** Gentle grassy hills round the airfield (a gap is left where the skyline stands). */
export const HILLS: { x: number; z: number; w: number; d: number; h: number }[] = (() => {
  const r = mulberry32(4242);
  const out: { x: number; z: number; w: number; d: number; h: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const deg = (i / 14) * 360 + (r() - 0.5) * 12;
    // skip the skyline's direction (~225 deg) and the camera side (~45 deg)
    const off = (a: number) => Math.min(Math.abs(deg - a), 360 - Math.abs(deg - a));
    // (the finale looks across 160-290 deg at the skyline's mist: nothing there)
    if (off(225) < 65 || off(45) < 35) continue;
    const [x, z] = P(deg, 44 + r() * 12);
    const hill = { x, z, w: 8 + r() * 6, d: 6 + r() * 4, h: 3 + r() * 3 };
    // keep clear of the HDB estate and of anything the farm/camp put down
    const inEllipse = (px: number, pz: number, pad: number) =>
      ((px - hill.x) / (hill.w + pad)) ** 2 + ((pz - hill.z) / (hill.d + pad)) ** 2 < 1;
    const hdb = [-38, -24, -10].some((hx) => [18, 27, 36].some((hz) => inEllipse(hx, hz, 4)));
    const props = FOOTPRINTS.some(([fx, fz, fr]) => inEllipse(fx, fz, fr + 1));
    if (hdb || props) continue;
    out.push(hill);
  }
  return out;
})();
/** Is (x, z) on a hill (plus a margin)? Houses and hedgerows stay off them. */
export const onHill = (x: number, z: number, pad = 1.5) =>
  HILLS.some((h) => ((x - h.x) / (h.w + pad)) ** 2 + ((z - h.z) / (h.d + pad)) ** 2 < 1);

function Hills() {
  return (
    <group>
      {HILLS.map((h, i) => (
        <mesh key={i} position={[h.x, -0.2, h.z]} scale={[h.w, h.h, h.d]} receiveShadow>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#86A35A"
            roughness={1}
            onBeforeCompile={distanceHaze}
            customProgramCacheKey={distanceHazeKey}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ sky life */

const PILOTS = [
  { cx: -7, cz: -6, r: 4.5, top: 15, bottom: 3, speed: 0.55, w: 0.45, phase: 0, colors: undefined },
  {
    cx: -15,
    cz: 2,
    r: 3.5,
    top: 17,
    bottom: 4,
    speed: 0.45,
    w: -0.5,
    phase: 6,
    colors: [
      palette.signNavy,
      palette.cream,
      palette.signNavy,
      palette.cream,
      palette.signNavy,
      palette.cream,
      palette.signNavy,
    ],
  },
] as const;

function CanopyPilot({ spec }: { spec: (typeof PILOTS)[number] }) {
  const g = useRef<Group>(null);
  useFrame((state) => {
    const o = g.current;
    if (!o) return;
    const time = state.clock.elapsedTime + spec.phase;
    const span = spec.top - spec.bottom;
    const fall = (time * spec.speed) % span;
    const y = spec.top - fall;
    const a = time * spec.w;
    o.position.set(spec.cx + Math.cos(a) * spec.r, y, spec.cz + Math.sin(a) * spec.r);
    // Face along the turn; pop in at the top and shrink away just before "landing".
    o.rotation.set(0, -a + (spec.w > 0 ? 0 : Math.PI), Math.sign(spec.w) * 0.25);
    const s = Math.min(1, fall / 0.8, (span - fall) / 1.2) * 0.45;
    o.scale.setScalar(Math.max(0.001, s));
  });
  return (
    <group ref={g}>
      <Canopy colors={spec.colors} />
      <mesh position={[0, 0.45, 0]}>
        <capsuleGeometry args={[0.18, 0.4, 4, 8]} />
        <Matte color={palette.canopyTeal} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <Matte color={palette.canopyYellow} />
      </mesh>
    </group>
  );
}

function CirclingPlane() {
  const g = useRef<Group>(null);
  useFrame((state) => {
    const o = g.current;
    if (!o) return;
    const a = state.clock.elapsedTime * 0.12;
    o.position.set(-12 + Math.cos(a) * 26, 24 + Math.sin(a * 2) * 1.5, -12 + Math.sin(a) * 26);
    o.rotation.set(0, -a + Math.PI, 0.3);
  });
  return (
    <group ref={g}>
      <Kit name="misc/small-airplane-balak" scale={0.55} />
    </group>
  );
}

function Birds() {
  const g = useRef<Group>(null);
  const wings = useRef<(Group | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (g.current) {
      const k = ((t * 0.018) % 1) * 2 - 1; // -1 → 1, wrapping far out of view
      g.current.position.set(-12 + k * 140, 13 + Math.sin(t * 0.5), -12 - k * 140);
    }
    wings.current.forEach((w, i) => {
      if (w) w.rotation.z = Math.sin(t * 9 + i) * 0.6;
    });
  });
  return (
    <group ref={g} rotation={[0, 0.9, 0]}>
      {[
        [0, 0],
        [-0.8, 0.7],
        [0.8, 0.7],
        [-1.6, 1.4],
        [1.6, 1.4],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[-1, 1].map((side) => (
            <group
              key={side}
              ref={(w) => {
                wings.current[i * 2 + (side > 0 ? 1 : 0)] = w;
              }}
              scale={[side, 1, 1]}
            >
              <mesh position={[0.22, 0, 0]} rotation={[0, 0, 0.2]}>
                <boxGeometry args={[0.45, 0.04, 0.16]} />
                <Matte color={palette.ink} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Always up there: other jumpers landing, the plane going round again, birds. */
function SkyLife() {
  return (
    <group>
      {PILOTS.map((p) => (
        <CanopyPilot key={p.cx} spec={p} />
      ))}
      <CirclingPlane />
      <Birds />
    </group>
  );
}

preloadKit([
  "kenney/crops_wheatStageB",
  "kenney/crops_cornStageC",
  "industrial/windmill",
  "survival/campfire-pit",
  "survival/bedroll",
  "survival/signpost",
  "survival/barrel",
  "survival/box",
  "car/van",
  "car/tractor",
  "car/truck-flat",
  "city/building_A",
  "city/building_B",
  "city/building_C",
  "city/building_D",
  "city/building_E",
  "city/building_F",
  "city/building_G",
  "city/building_H",
  "kenney/mug",
  "misc/small-airplane-balak",
]);

export function DropzoneSurroundings() {
  return (
    <group>
      {/* farm */}
      <mesh position={[FARM_C[0] + 0.1, 0.22, FARM_C[1] + 0.1]} receiveShadow>
        <boxGeometry args={[11, 0.04, 8.6]} />
        <Matte color={palette.earth} />
      </mesh>
      {CROPS.map(([name, x, z], i) => (
        <Kit key={i} name={name} position={[x, 0.24, z]} scale={1.5} />
      ))}
      <Barn />
      <Kit
        name="car/tractor"
        position={[P(201, 19.2)[0], 0, P(201, 19.2)[1]]}
        rotation={[0, 2.2, 0]}
        scale={1.1}
      />
      <Kit
        name="car/truck-flat"
        position={[P(222, 27)[0], 0, P(222, 27)[1]]}
        rotation={[0, 0.4, 0]}
        scale={1.2}
      />
      {BALES.map(([x, z, r]) => (
        <mesh key={`${x},${z}`} position={[x, 0.4, z]} rotation={[Math.PI / 2, 0, r]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.75, 16]} />
          <Matte color={palette.canopyYellow} />
        </mesh>
      ))}
      {WINDMILLS.map(([x, z, r]) => (
        <Kit
          key={x}
          name="industrial/windmill"
          position={[x, 0, z]}
          rotation={[0, r, 0]}
          scale={3.2}
        />
      ))}

      <Camp />
      {VILLAGE.map(([name, x, z, r], i) => (
        <Kit key={`v${i}`} name={name} position={[x, 0, z]} rotation={[0, r, 0]} scale={2.4} />
      ))}
      {WOODS.map(([name, x, z, rot, sc], i) => (
        <Kit key={`w${i}`} name={name} position={[x, 0, z]} rotation={[0, rot, 0]} scale={sc} />
      ))}
      <Hills />
      <SkyLife />
    </group>
  );
}
