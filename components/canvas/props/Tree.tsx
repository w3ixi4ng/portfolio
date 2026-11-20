"use client";

import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

export type TreeKind = "round" | "pine" | "snowPine" | "palm" | "cactus";

interface TreeProps {
  kind?: TreeKind;
  position?: [number, number, number];
  scale?: number;
}

const TRUNK = "#8A5A3B";
const LEAF = "#5FA84A";

/** Small stylised trees. Placeholder until CC0 models are dropped in. */
export function Tree({ kind = "round", position, scale = 1 }: TreeProps) {
  return (
    <group position={position} scale={scale}>
      {kind === "cactus" ? (
        <>
          <mesh position={[0, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.45, 4, 10]} />
            <Matte color="#6DAA5C" />
          </mesh>
          <mesh position={[0.17, 0.42, 0]} rotation={[0, 0, -0.2]} castShadow>
            <capsuleGeometry args={[0.07, 0.18, 4, 8]} />
            <Matte color="#6DAA5C" />
          </mesh>
        </>
      ) : (
        <mesh
          position={[0, kind === "palm" ? 0.4 : 0.2, 0]}
          castShadow
          rotation={[0, 0, kind === "palm" ? 0.12 : 0]}
        >
          <cylinderGeometry args={[0.06, 0.09, kind === "palm" ? 0.8 : 0.4, 8]} />
          <Matte color={TRUNK} />
        </mesh>
      )}

      {kind === "round" && (
        <mesh position={[0, 0.62, 0]} castShadow>
          <icosahedronGeometry args={[0.34, 1]} />
          <Matte color={LEAF} />
        </mesh>
      )}

      {(kind === "pine" || kind === "snowPine") &&
        [0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.45 + i * 0.22, 0]} castShadow>
            <coneGeometry args={[0.34 - i * 0.08, 0.36, 8]} />
            <Matte color={kind === "snowPine" && i === 2 ? palette.paper : "#3F8A4E"} />
          </mesh>
        ))}

      {kind === "palm" &&
        [0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[0.05 + Math.cos(i * 1.26) * 0.2, 0.8, Math.sin(i * 1.26) * 0.2]}
            rotation={[Math.sin(i * 1.26) * 0.6, i * 1.26, -Math.cos(i * 1.26) * 0.6]}
            castShadow
          >
            <boxGeometry args={[0.42, 0.03, 0.14]} />
            <Matte color={LEAF} />
          </mesh>
        ))}
    </group>
  );
}
