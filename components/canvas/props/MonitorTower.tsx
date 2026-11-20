"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";
import { Kit } from "./Kit";

/** Platform Migration island: the monitoring tower keeps blinking happily. */
export function MonitorTower({ position }: { position: [number, number, number] }) {
  const light = useRef<MeshStandardMaterial>(null);
  useFrame((state) => {
    if (!light.current) return;
    const on = scrollState.reducedMotion || Math.sin(state.clock.elapsedTime * 4) > 0;
    light.current.emissiveIntensity = on ? 1.6 : 0.15;
  });
  return (
    <group position={position}>
      <Kit name="city/watertower" scale={2.1} />
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
        <Matte color={palette.ink} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial
          ref={light}
          color="#7CF2A6"
          emissive="#4CE38A"
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
}
