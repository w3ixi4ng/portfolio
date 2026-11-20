"use client";

import { RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

const COLORS = [
  palette.canopyRed,
  palette.canopyYellow,
  palette.canopyTeal,
  palette.canopyYellow,
  palette.canopyRed,
  palette.canopyYellow,
  palette.canopyTeal,
] as const;

/** Deterministic little irregularities so the heap looks dropped, not laid out by a ruler. */
const CELLS = COLORS.map((color, i) => {
  const k = i - 3;
  return {
    color,
    // The wing spreads across local z; the lines leave its front edge (+x).
    x: Math.sin(i * 1.7) * 0.14 + (i % 2) * 0.06,
    z: k * 0.46 + Math.sin(i * 2.3) * 0.08,
    yaw: Math.sin(i * 3.1) * 0.22,
    tilt: Math.sin(i * 1.3) * 0.1,
    scaleX: 0.85 + (i % 3) * 0.12,
  };
});

/**
 * A few loose lines: they leave the heap's front edge, wander a little, and gather into a
 * small knot a short way out (they stop well before the jumper). Origin = heap centre,
 * local +x toward the landing spot.
 */
const LINE_GEOMETRIES = [-0.42, -0.14, 0.14, 0.42].map((z0, i) => {
  const wiggle = Math.sin(i * 2.1) * 0.12;
  const curve = new CatmullRomCurve3([
    new Vector3(0.5, 0.03, z0),
    new Vector3(0.85, 0.025, z0 * 0.75 + wiggle),
    new Vector3(1.2, 0.025, z0 * 0.32 - wiggle * 0.6),
    new Vector3(1.5, 0.03, z0 * 0.06),
  ]);
  return new TubeGeometry(curve, 24, 0.016, 5, false);
});

/**
 * The canopy after landing: a flat, slightly crumpled heap of cells on the grass, with a few
 * suspension lines trailing back to the jumper. Local +x points toward the landing spot.
 */
export function GroundCanopy({ colors }: { colors?: readonly string[] }) {
  return (
    <group>
      {CELLS.map((c, i) => (
        <RoundedBox
          key={i}
          args={[1.05, 0.2, 0.5]}
          position={[c.x, 0.1, c.z]}
          rotation={[c.tilt, c.yaw, 0]}
          scale={[c.scaleX, 1, 1]}
          radius={0.07}
          castShadow
          receiveShadow
        >
          <Matte color={colors?.[i] ?? c.color} />
        </RoundedBox>
      ))}
      {LINE_GEOMETRIES.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#6B6470" roughness={0.9} />
        </mesh>
      ))}
      {/* the knot where the lines gather */}
      <mesh position={[1.52, 0.05, 0]} scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.07, 10, 8]} />
        <Matte color="#6B6470" />
      </mesh>
    </group>
  );
}
