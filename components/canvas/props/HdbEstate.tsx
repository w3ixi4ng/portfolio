"use client";

import { palette } from "@/lib/theme";
import { Glow } from "../Glow";
import { Matte } from "../Matte";

interface Block {
  x: number;
  z: number;
  rotY: number;
  length: number;
  height: number;
  body: string;
  core: string;
}

const BLOCKS: Block[] = [
  { x: -29, z: 23, rotY: 0, length: 6.4, height: 3.6, body: "#F2E3C6", core: palette.terracotta },
  {
    x: -21.5,
    z: 23.6,
    rotY: 0,
    length: 5.6,
    height: 3.1,
    body: "#CFE0E6",
    core: palette.canopyTeal,
  },
  { x: -14.5, z: 23, rotY: 0, length: 6.4, height: 3.9, body: "#EBC7A6", core: palette.signNavy },
  {
    x: -27.5,
    z: 31,
    rotY: Math.PI / 2,
    length: 5.4,
    height: 3.3,
    body: "#F4D9D0",
    core: palette.canopyTeal,
  },
  { x: -19.5, z: 31, rotY: 0, length: 6.2, height: 3.7, body: "#E6E3B4", core: palette.terracotta },
  {
    x: -12.5,
    z: 31,
    rotY: Math.PI / 2,
    length: 5.4,
    height: 3.2,
    body: "#CFE0E6",
    core: palette.signNavy,
  },
];

const DEPTH = 1.5;
const FLOORS = 5;

/** One HDB block: pastel slab, white parapet bands, window rows, lift core, flat roof. */
function HdbBlock({ b }: { b: Block }) {
  const rows = Array.from({ length: FLOORS }, (_, i) => ((i + 0.6) / FLOORS) * b.height);
  return (
    <group position={[b.x, 0, b.z]} rotation={[0, b.rotY, 0]}>
      <mesh position={[0, b.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.length, b.height, DEPTH]} />
        <Matte color={b.body} roughness={0.9} />
      </mesh>
      {/* dark void deck at the base */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[b.length * 0.98, 0.56, DEPTH + 0.02]} />
        <Matte color="#5B5560" roughness={1} />
      </mesh>
      {/* white parapet bands */}
      {[0.38, 0.62, 0.86].map((k) => (
        <mesh key={k} position={[0, k * b.height, 0]}>
          <boxGeometry args={[b.length * 1.015, 0.07, DEPTH + 0.06]} />
          <Matte color={palette.paper} />
        </mesh>
      ))}
      {/* window rows, both long faces (they glow at night) */}
      {rows.map((y) =>
        [-1, 1].map((side) => (
          <mesh key={`${y}-${side}`} position={[0, y, side * (DEPTH / 2 + 0.005)]}>
            <boxGeometry args={[b.length * 0.9, 0.16, 0.02]} />
            <Glow color="#6F7C88" emissive="#FFCB7A" off={0.02} on={1.5} />
          </mesh>
        )),
      )}
      {/* lift/stair core at one end, a little taller */}
      <mesh position={[b.length / 2 - 0.55, (b.height + 0.5) / 2, 0]} castShadow>
        <boxGeometry args={[0.9, b.height + 0.5, DEPTH + 0.3]} />
        <Matte color={b.core} roughness={0.85} />
      </mesh>
      {/* flat roof + water tank */}
      <mesh position={[0, b.height + 0.05, 0]}>
        <boxGeometry args={[b.length * 0.98, 0.1, DEPTH * 0.98]} />
        <Matte color="#B9B6B0" />
      </mesh>
      <mesh position={[-b.length / 4, b.height + 0.22, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.32, 12]} />
        <Matte color="#CFCAC2" />
      </mesh>
    </group>
  );
}

/** A little HDB estate in the ground patchwork (settings.singaporeTouch): blocks round a plaza. */
export function HdbEstate() {
  return (
    <group>
      {/* paved estate base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-21, 0.07, 27]} receiveShadow>
        <planeGeometry args={[24, 15]} />
        <Matte color={palette.terrazzo} roughness={1} />
      </mesh>
      {BLOCKS.map((b, i) => (
        <HdbBlock key={i} b={b} />
      ))}
    </group>
  );
}

/** Cells (grid indices) the estate occupies, so the field patchwork leaves room for it. */
export const HDB_CELLS = { i: [-4, -1], j: [2, 3] } as const;
