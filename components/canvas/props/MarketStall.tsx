"use client";

import { RoundedBox } from "@react-three/drei";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

interface MarketStallProps {
  position: [number, number, number];
  color: string;
  rotation?: number;
}

/** Striped market stall (code-built: no pack has one). */
export function MarketStall({ position, color, rotation = 0 }: MarketStallProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.8, 0.45, 0.55]} position={[0, 0.22, 0]} radius={0.06} castShadow>
        <Matte color="#D9A777" />
      </RoundedBox>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.6, 0.22]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
          <Matte color={palette.ink} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.3 + i * 0.2, 0.84, 0.1]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.05, 0.75]} />
          <Matte color={i % 2 === 0 ? color : palette.paper} />
        </mesh>
      ))}
    </group>
  );
}
