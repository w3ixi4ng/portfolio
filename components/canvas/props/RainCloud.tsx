"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

/** Platform Migration island: a little cloud that rains (on purpose). */
export function RainCloud({ position }: { position: [number, number, number] }) {
  const drops = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    drops.current.forEach((d, i) => {
      if (!d) return;
      d.visible = !scrollState.reducedMotion;
      d.position.y = -((t * 2.2 + i * 0.37) % 1.4);
    });
  });
  return (
    <group position={position}>
      {[
        [0, 0, 0, 0.42],
        [-0.38, -0.05, 0.05, 0.3],
        [0.38, -0.04, -0.05, 0.32],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.75, s]}>
          <sphereGeometry args={[1, 14, 10]} />
          <Matte color="#C7CCD6" />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            drops.current[i] = m;
          }}
          position={[((i * 37) % 9) / 9 - 0.45, 0, ((i * 53) % 7) / 7 - 0.4]}
        >
          <cylinderGeometry args={[0.012, 0.012, 0.16, 4]} />
          <meshBasicMaterial color={palette.skyTop} />
        </mesh>
      ))}
    </group>
  );
}
