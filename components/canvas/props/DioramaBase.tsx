"use client";

import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

interface DioramaBaseProps {
  radius: number;
  top?: string;
  soil?: string;
  rock?: string;
  /** Depth of the hanging underside, as a multiple of radius. */
  depth?: number;
  segments?: number;
}

/**
 * A floating chunk of land, the building block of every diorama: a chunky rounded
 * top layer, a soil band, and a tapered rocky underside. Origin = top surface centre.
 */
export function DioramaBase({
  radius,
  top = palette.grass,
  soil = palette.earth,
  rock = "#9C6B4A",
  depth = 0.9,
  segments = 9,
}: DioramaBaseProps) {
  const r = radius;
  return (
    <group>
      {/* grass cap with a soft lip */}
      <mesh position={[0, -0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[r, r * 1.02, 0.24, segments * 3]} />
        <Matte color={top} />
      </mesh>
      {/* soil band */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <cylinderGeometry args={[r * 1.0, r * 0.9, 0.38, segments * 3]} />
        <Matte color={soil} />
      </mesh>
      {/* rocky underside, faceted for that low-poly look */}
      <mesh position={[0, -0.61 - (r * depth) / 2, 0]} rotation={[Math.PI, 0.3, 0]} castShadow>
        <coneGeometry args={[r * 0.9, r * depth, segments, 2]} />
        <Matte color={rock} />
      </mesh>
    </group>
  );
}
