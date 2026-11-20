"use client";

import { settings } from "@/content";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";
import { HangarHub } from "../props/HangarHub";
import { KopiStall } from "../props/KopiStall";
import { Lamppost } from "../props/Lamppost";
import { Kit, preloadKit, type KitName } from "../props/Kit";
import { mulberry32 } from "../props/CloudField";
import { GROUND_Y } from "../path";
import { HANGARS, KOPI_AT, KOPI_YAW, PLAZA, facing } from "../hangarLayout";
import { DropzoneEggs } from "./DropzoneEggs";

/** Scales that bring each pack to our jumper size (1.35 units tall). */
const CITY = 2.6;
const PROP = 0.45;
const TREE = 3;

type Placed = [KitName, [number, number, number], number, number]; // name, pos, rotY, scale

const rand = mulberry32(2026);
const TREE_KINDS: KitName[] = [
  "nature/tree_oak",
  "nature/tree_default",
  "nature/tree_fat",
  "nature/tree_detailed",
  "nature/tree_pineRoundA",
  "nature/tree_small",
];
const FLOWER_KINDS: KitName[] = [
  "nature/flower_redA",
  "nature/flower_yellowA",
  "nature/flower_purpleA",
  "nature/plant_bush",
  "nature/plant_bushLarge",
  "nature/grass_large",
];

/** Trees in a loose ring just outside the fence. */
const TREES: Placed[] = Array.from({ length: 34 }, (_, i) => {
  const a = (i / 34) * Math.PI * 2 + rand() * 0.15;
  const r = 14.8 + rand() * 6;
  return [
    TREE_KINDS[i % TREE_KINDS.length],
    [Math.cos(a) * r, 0, Math.sin(a) * r],
    rand() * Math.PI * 2,
    TREE * (0.8 + rand() * 0.5),
  ];
});
TREES.splice(0, TREES.length, ...TREES.filter(([, [x, , z]]) => !(x > 2 && z > 2)));
/** Flowers and bushes tucked along the inside of the fence. */
const FLOWERS_ALL: Placed[] = Array.from({ length: 44 }, (_, i) => {
  const a = rand() * Math.PI * 2;
  const r = 10.4 + rand() * 1.6;
  return [
    FLOWER_KINDS[i % FLOWER_KINDS.length],
    [Math.cos(a) * r, 0, Math.sin(a) * r],
    rand() * Math.PI * 2,
    1.6 + rand() * 0.8,
  ];
});
/** Big things: [x, z, radius]. Flowers keep clear of them; fence pieces touching them are skipped. */
const OBSTACLES: [number, number, number][] = [
  ...HANGARS.map((h): [number, number, number] => [h.x, h.z, 4.4]),
  [6.6, 10.0, 3.0], // parked plane
  [KOPI_AT[0], KOPI_AT[2], 2.8], // kopi stall
  [9.0, -1.0, 2.2], // parked car
];
const FLOWERS: Placed[] = FLOWERS_ALL.filter(
  ([, [x, , z]]) => !OBSTACLES.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r),
);
const FIELD_R = 13.5;
const FENCE_R = 12.8;
/** Fence ring, with a gap facing the camera so the view stays open. */
const FENCE: Placed[] = Array.from({ length: 42 }, (_, i): Placed => {
  const a = (i / 42) * Math.PI * 2;
  return [
    "kenney/fence_simple",
    [Math.cos(a) * FENCE_R, 0, Math.sin(a) * FENCE_R],
    -a + Math.PI / 2,
    2,
  ];
}).filter(
  ([, [x, , z]]) =>
    !(x > 2 && z > 2) && !OBSTACLES.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r),
);

/** Street furniture, crates and parked things around the airfield (clear of the three hangars). */
const PROPS: Placed[] = [
  // The taxi's wheels sit 0.06 (x scale) below its origin: lift it so it rests on the grass,
  // and park it well inside the fence, parallel to it.
  ["city/car_taxi", [9.0, 0.2, -1.0], 0.11, CITY],
  ["city/bench", [3.8, 0, 1.2], -3.0, CITY],
  ["city/bench", [2.4, 0, -1.9], -Math.PI / 2 - 0.5, CITY],
  ["city/box_A", [10.2, 0, 5.2], 0.3, CITY * 1.3],
  ["city/box_B", [10.8, 0, 5.8], -0.4, CITY * 1.3],
  ["resource/Pallet_Wood_Covered_A", [9.6, 0, 7.4], 0.2, PROP],
  ["resource/Fuel_A_Barrel", [11.2, 0, 3.6], 0, PROP * 1.1],
  ["resource/Fuel_A_Barrel", [11.8, 0, 4.2], 0.6, PROP * 1.1],
  ["resource/Wood_Log_Stack", [10.0, 0, -7.2], 1.1, PROP],
  ["nature/rock_largeA", [-1.2, 0, 9.4], 0.4, 2.2],
  ["nature/rock_smallA", [0.4, 0, 9.8], 1.2, 2],
  ["nature/stump_round", [2.4, 0, 8.2], 0.3, 2.2],
  ["nature/mushroom_redGroup", [2.9, 0, 8.7], 0, 2],
];

/** Packing area: striped mat, packed canopies and a stool (the packer is added below). */
const PACKING: Placed[] = [
  ["furniture/rug_rectangle_stripes_A", [0, 0, 0], 0, 0.8],
  ["resource/Textiles_Stack_Large_Colored", [2.0, 0, -0.6], 0.3, PROP * 0.9],
  ["resource/Textiles_A", [-2.0, 0, 0.5], 0.6, PROP * 1.2],
];

preloadKit([
  ...new Set([...TREES, ...FLOWERS, ...FENCE, ...PROPS, ...PACKING].map(([n]) => n)),
  "misc/small-airplane-balak",
]);

function KitList({ items }: { items: Placed[] }) {
  return (
    <>
      {items.map(([name, pos, rot, s], i) => (
        <Kit key={`${name}-${i}`} name={name} position={pos} rotation={[0, rot, 0]} scale={s} />
      ))}
    </>
  );
}

/** Gravel path from the plaza to a hangar's door: [mid x, mid z, length, yaw]. */
const PATHS = HANGARS.map((h) => {
  const door: [number, number] = [h.x + Math.sin(facing(h)) * 3.2, h.z + Math.cos(facing(h)) * 3.2];
  const len = Math.hypot(door[0] - PLAZA[0], door[1] - PLAZA[1]);
  return {
    key: h.section,
    x: (door[0] + PLAZA[0]) / 2,
    z: (door[1] + PLAZA[1]) / 2,
    len,
    yaw: facing(h) + Math.PI,
  };
});

/**
 * The landing diorama: a mown field with three hangars in a triangle round the landing plaza
 * (Projects, Experience, Skills; click one and I walk in), a parked plane, packing mat,
 * kopi stall, fence, trees and flowers. Always mounted: it's part of the ground seen from
 * 13,000 ft (CLAUDE.md section 4).
 */
export function DropzoneZone() {
  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* mown landing field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[FIELD_R, 56]} />
        <Matte color={palette.grassLit} roughness={1} />
      </mesh>

      {/* gravel plaza + a path to each hangar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PLAZA[0], 0.03, PLAZA[1]]} receiveShadow>
        <circleGeometry args={[2.5, 36]} />
        <Matte color="#D9C29A" roughness={1} />
      </mesh>
      {PATHS.map((p) => (
        <group key={p.key} position={[p.x, 0.03, p.z]} rotation={[0, p.yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1.4, p.len]} />
            <Matte color="#D9C29A" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* landing target */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PLAZA[0], 0.05, PLAZA[1]]}>
        <ringGeometry args={[0.9, 1.3, 40]} />
        <Matte color={palette.paper} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PLAZA[0], 0.06, PLAZA[1]]}>
        <circleGeometry args={[0.35, 28]} />
        <Matte color={palette.canopyRed} />
      </mesh>

      {HANGARS.map((h) => (
        <HangarHub key={h.section} spec={h} />
      ))}

      {/* the jump plane's little sister, parked on the grass (CC-BY, see CREDITS) */}
      <Kit
        name="misc/small-airplane-balak"
        position={[6.6, 1.24 * 0.42, 10.0]}
        rotation={[0, 0.9, 0]}
        scale={0.42}
      />

      <group position={[3.8, 0.02, 3.4]} rotation={[0, -Math.PI / 4, 0]}>
        <KitList items={PACKING} />
      </group>

      {/* lampposts: they light up at night */}
      <Lamppost position={[-2.4, 0, -3.0]} />
      <Lamppost position={[5.6, 0, -3.4]} />
      <Lamppost position={[3.2, 0, 5.4]} />
      <Lamppost position={[-4.4, 0, 3.2]} />

      <KitList items={PROPS} />
      <KitList items={FENCE} />
      <KitList items={FLOWERS} />
      <KitList items={TREES} />

      {/* The kopi stall faces the camera (+x,+z), so you see the counter, not its back wall. */}
      {settings.singaporeTouch && (
        <group position={KOPI_AT} rotation={[0, KOPI_YAW, 0]}>
          <KopiStall />
        </group>
      )}

      <DropzoneEggs />
    </group>
  );
}
