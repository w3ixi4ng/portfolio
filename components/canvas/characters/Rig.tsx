"use client";

import { RoundedBox } from "@react-three/drei";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

/** Three container shapes so jumpers don't all carry the same bag. */
export type RigStyle = "round" | "pack" | "wide";

interface RigProps {
  style: RigStyle;
  color: string;
  trim: string;
}

/**
 * The parachute container on a jumper's back. Origin = chest bone; the bag sits behind it
 * (−z). Each style has a different silhouette from above, where the back is what you see.
 */
export function Rig({ style, color, trim }: RigProps) {
  switch (style) {
    case "pack":
      // Tall squared pack with a cross-strap and a top flap.
      return (
        <group position={[0, 0.04, -0.21]}>
          <RoundedBox args={[0.34, 0.46, 0.17]} radius={0.04} castShadow>
            <Matte color={color} />
          </RoundedBox>
          <mesh position={[0, 0.02, -0.001]}>
            <boxGeometry args={[0.352, 0.05, 0.176]} />
            <Matte color={trim} />
          </mesh>
          <RoundedBox args={[0.3, 0.09, 0.19]} radius={0.03} position={[0, 0.2, 0]}>
            <Matte color={trim} />
          </RoundedBox>
        </group>
      );
    case "wide":
      // Low, wide bag with two side pouches.
      return (
        <group position={[0, 0.0, -0.19]}>
          <RoundedBox args={[0.46, 0.3, 0.14]} radius={0.05} castShadow>
            <Matte color={color} />
          </RoundedBox>
          {[-0.28, 0.28].map((x) => (
            <mesh key={x} position={[x, -0.04, 0.0]} castShadow>
              <capsuleGeometry args={[0.06, 0.1, 4, 8]} />
              <Matte color={trim} />
            </mesh>
          ))}
          <mesh position={[0, 0.0, -0.075]}>
            <boxGeometry args={[0.4, 0.04, 0.012]} />
            <Matte color={palette.ink} />
          </mesh>
        </group>
      );
    default:
      // Rounded roll with a stripe.
      return (
        <group position={[0, 0.02, -0.2]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.15, 0.14, 4, 12]} />
            <Matte color={color} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.152, 0.018, 8, 24]} />
            <Matte color={trim} />
          </mesh>
        </group>
      );
  }
}
