"use client";

import { Instance, Instances, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Glow } from "../Glow";
import { Matte } from "../Matte";
import { Canopy } from "./Canopy";
import { mulberry32 } from "./CloudField";
import { HazeMaterial } from "./HazeMaterial";
import { Kit, preloadKit, type KitName } from "./Kit";

/**
 * Life around the airfield, outside the tree ring (the camera looks from +x,+z toward -x,-z,
 * so screen-right is +x,-z and screen-left is -x,+z):
 *  - a little farm on the right: crop rows, a red barn, a silo, hay bales, windmills behind
 *  - a jumpers' campsite on the left: tents in canopy colours, a campfire, a camper car
 *  - low hazy hills round the horizon (gap left for the skyline)
 *  - sky life over the landing: two canopy pilots spiralling down, the jump plane circling
 *    back up, and a few birds
 */

const rand = mulberry32(777);

/** World XZ from a bearing (degrees, 0 = +x, 90 = +z) and a distance from the plaza. */
const P = (deg: number, r: number): [number, number] => [
  Math.cos((deg * Math.PI) / 180) * r,
  Math.sin((deg * Math.PI) / 180) * r,
];
/**
 * Behind the hangars is what both the landing approach and the finale look at:
 * the farm sits between Hangar 03 and 02 (bearing ~205°), the camp between 02 and 01 (~262°).
 */
export const FARM_BEARING = [188, 224] as const;
export const CAMP_BEARING = [246, 280] as const;
const FARM_C = P(205, 25);

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
const WINDMILLS: [number, number, number][] = [
  [7, -38, 0.3],
  [15, -35, -0.2],
  [23, -31, 0.5],
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
      {/* campfire: logs, stones and a flame that glows at night */}
      <group position={[P(263, 22)[0], 0, P(263, 22)[1]]}>
        <Kit name="nature/log_stack" scale={1.2} />
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55]}>
              <dodecahedronGeometry args={[0.13]} />
              <Matte color="#9A9590" />
            </mesh>
          );
        })}
        <mesh position={[0, 0.42, 0]}>
          <coneGeometry args={[0.22, 0.55, 8]} />
          <Glow color="#FFB347" emissive="#FF7A1F" off={0.6} on={3.2} />
        </mesh>
      </group>
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
      <group position={[P(278, 26.5)[0], 0.2, P(278, 26.5)[1]]} rotation={[0, 0.2, 0]}>
        <Kit name="city/car_hatchback" scale={2.6} />
        <RoundedBox args={[0.9, 0.3, 0.6]} position={[0, 1.15, 0]} radius={0.1}>
          <Matte color={palette.canopyYellow} />
        </RoundedBox>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ hills */

const SKYLINE_ANGLE = Math.atan2(-1, -1);
const HILLS = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2 + (rand() - 0.5) * 0.15;
  let d = Math.abs(a - SKYLINE_ANGLE) % (Math.PI * 2);
  d = Math.min(d, Math.PI * 2 - d);
  const r = 40 + rand() * 16;
  const w = 7 + rand() * 7;
  return {
    position: [Math.cos(a) * r, -0.6, Math.sin(a) * r] as [number, number, number],
    scale: [w, 2.2 + rand() * 2.6, w * 0.8] as [number, number, number],
    keep: d > 0.6,
  };
}).filter((h) => h.keep);

function Hills() {
  return (
    <Instances limit={HILLS.length} range={HILLS.length} frustumCulled={false}>
      <sphereGeometry args={[1, 16, 10]} />
      <HazeMaterial color="#86A35A" amount={0.62} />
      {HILLS.map((h, i) => (
        <Instance key={i} position={h.position} scale={h.scale} />
      ))}
    </Instances>
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
      const k = ((t * 0.04) % 1) * 2 - 1; // -1 → 1, then wrap
      g.current.position.set(-30 + k * 40, 13 + Math.sin(t * 0.5), -6 - k * 40);
    }
    wings.current.forEach((w, i) => {
      if (w) w.rotation.z = Math.sin(t * 9 + i) * 0.6;
    });
  });
  return (
    <group ref={g} rotation={[0, -Math.PI / 4, 0]}>
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

/** Sky life only runs (and shows) from the canopy flight on. */
function SkyLife() {
  const g = useRef<Group>(null);
  useFrame(() => {
    if (g.current) g.current.visible = scrollState.current > 0.8;
  });
  return (
    <group ref={g} visible={false}>
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
  "nature/log_stack",
  "kenney/mug",
  "city/car_hatchback",
  "misc/small-airplane-balak",
]);

export function DropzoneSurroundings() {
  return (
    <group>
      {/* farm */}
      <mesh position={[FARM_C[0] + 0.1, 0.08, FARM_C[1] + 0.1]} receiveShadow>
        <boxGeometry args={[11, 0.04, 8.6]} />
        <Matte color={palette.earth} />
      </mesh>
      {CROPS.map(([name, x, z], i) => (
        <Kit key={i} name={name} position={[x, 0.1, z]} scale={1.5} />
      ))}
      <Barn />
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
          scale={4}
        />
      ))}

      <Camp />
      <Hills />
      <SkyLife />
    </group>
  );
}
