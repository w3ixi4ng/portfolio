"use client";

import { RoundedBox } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

const CELL_COLORS = [
  palette.canopyRed,
  palette.canopyYellow,
  palette.canopyTeal,
  palette.canopyYellow,
  palette.canopyRed,
  palette.canopyYellow,
  palette.canopyTeal,
] as const;
const CANOPY_HEIGHT = 2.7;
const SPAN = 3.2;
const HARNESS = new Vector3(0, 0.75, 0);
const UP = new Vector3(0, 1, 0);

/** Cells laid along a gentle arc (ram-air canopy seen from the front). */
const CELLS = CELL_COLORS.map((color, i) => {
  const k = i / (CELL_COLORS.length - 1) - 0.5; // -0.5 … 0.5
  return {
    color,
    // Cells sit edge-to-edge across SPAN, drooping at the tips like a real wing.
    position: new Vector3(k * SPAN, CANOPY_HEIGHT - (k * 2) ** 2 * 0.4, 0),
    rotationZ: -k * 0.9,
  };
});

/** Suspension lines from each cell to the harness. */
const LINES = CELLS.filter((_, i) => i % 2 === 0).flatMap((c) =>
  [-0.3, 0.3].map((dz) => {
    const top = c.position.clone().add(new Vector3(0, -0.15, dz));
    const dir = top.clone().sub(HARNESS);
    return {
      key: `${c.position.x.toFixed(2)},${dz}`,
      mid: HARNESS.clone().add(top).multiplyScalar(0.5),
      length: dir.length(),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.normalize()),
    };
  }),
);

/** Reserve colours: bright orange and white, so it reads as a different canopy. */
export const RESERVE_COLORS: readonly string[] = [
  "#FF8A1F",
  "#FFF6EC",
  "#FF8A1F",
  "#FFF6EC",
  "#FF8A1F",
  "#FFF6EC",
  "#FF8A1F",
];

/** Chunky toy ram-air canopy. Origin = jumper's feet. Spans along local x. */
export function Canopy({ colors }: { colors?: readonly string[] }) {
  return (
    <group>
      {CELLS.map((c, i) => (
        <RoundedBox
          key={i}
          args={[SPAN / CELL_COLORS.length + 0.04, 0.32, 1.05]}
          position={c.position}
          rotation={[0, 0, c.rotationZ]}
          radius={0.1}
          castShadow
        >
          <Matte color={colors?.[i] ?? c.color} />
        </RoundedBox>
      ))}
      {LINES.map((l) => (
        <mesh key={l.key} position={l.mid} quaternion={l.quaternion}>
          <cylinderGeometry args={[0.012, 0.012, l.length, 4]} />
          <meshBasicMaterial color={palette.ink} />
        </mesh>
      ))}
    </group>
  );
}
