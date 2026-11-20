"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

const PAPERS = 5;

/** Content Pipeline island: a little press with spinning rollers shooting out newspapers. */
export function PrintingPress({ position }: { position: [number, number, number] }) {
  const rollers = useRef<(Mesh | null)[]>([]);
  const papers = useRef<(Group | null)[]>([]);
  useFrame((state, delta) => {
    const still = scrollState.reducedMotion;
    rollers.current.forEach((r) => {
      if (r && !still) r.rotation.y -= delta * 5;
    });
    const t = state.clock.elapsedTime;
    papers.current.forEach((p, i) => {
      if (!p) return;
      const k = (t * 0.45 + i / PAPERS) % 1;
      p.visible = !still;
      p.position.set(0.5 + k * 1.6, 0.7 + Math.sin(k * Math.PI) * 1.1, Math.sin(i * 2.3) * k * 0.6);
      p.rotation.set(k * 4, k * 3 + i, k * 2);
    });
  });
  return (
    <group position={position}>
      <RoundedBox args={[0.9, 0.7, 0.6]} position={[0, 0.35, 0]} radius={0.06} castShadow>
        <Matte color={palette.signNavy} />
      </RoundedBox>
      {[0.18, 0.36].map((y, i) => (
        <group key={y} position={[0.46, 0.2 + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            ref={(m) => {
              rollers.current[i] = m;
            }}
          >
            <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
            <Matte color={palette.terrazzo} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: PAPERS }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            papers.current[i] = g;
          }}
        >
          <mesh>
            <boxGeometry args={[0.28, 0.01, 0.2]} />
            <Matte color={palette.paper} />
          </mesh>
          <mesh position={[0, 0.006, -0.04]}>
            <boxGeometry args={[0.22, 0.004, 0.05]} />
            <Matte color={palette.ink} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
