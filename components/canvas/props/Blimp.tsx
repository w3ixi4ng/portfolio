"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Glow } from "../Glow";
import { Matte } from "../Matte";

/** Seconds for one pass across the skyline (it loops far off-screen at each end). */
const CROSSING = 140;
const SPAN = 150;

/**
 * A little blimp drifting along the skyline: cream envelope with canopy-coloured bands,
 * four fins, a gondola whose windows glow at night and a blinking nav light. Lives in the
 * skyline group (local +x runs along the skyline).
 */
export function Blimp() {
  const g = useRef<Group>(null);
  const body = useRef<Group>(null);
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (g.current) {
      const k = scrollState.reducedMotion ? 0.35 : ((time / CROSSING) % 1) - 0.5;
      g.current.position.set(k * SPAN, 27 + Math.sin(time * 0.3) * 0.4, 4);
    }
    // a lazy nose-up/nose-down bob
    if (body.current && !scrollState.reducedMotion)
      body.current.rotation.z = Math.sin(time * 0.4) * 0.04;
  });
  return (
    <group ref={g}>
      <group ref={body}>
        {/* envelope (nose toward +x, the way it travels) */}
        <mesh scale={[3.2, 1.05, 1.05]} castShadow>
          <sphereGeometry args={[1, 28, 16]} />
          <Matte color={palette.cream} />
        </mesh>
        {[-0.9, 0.9].map((x, i) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[
                1.05 * Math.sqrt(1 - (x / 3.2) ** 2) + 0.01,
                1.05 * Math.sqrt(1 - (x / 3.2) ** 2) + 0.01,
                0.35,
                28,
                1,
                true,
              ]}
            />
            <Matte color={i ? palette.canopyRed : palette.canopyTeal} side={2} />
          </mesh>
        ))}
        {/* tail fins */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
          <mesh key={a} position={[-2.7, 0, 0]} rotation={[a, 0, 0]}>
            <boxGeometry args={[0.9, 0.06, 1.5]} />
            <Matte color={palette.canopyRed} />
          </mesh>
        ))}
        {/* gondola with windows */}
        <mesh position={[0.3, -1.18, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.9, 6, 12]} />
          <Matte color={palette.signNavy} />
        </mesh>
        <mesh position={[0.3, -1.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.245, 0.245, 0.75, 14, 1, true, 0.6, 1.9]} />
          <Glow color="#E9EEF5" emissive="#FFD58A" off={0.05} on={2.2} />
        </mesh>
        {/* nav light on the nose */}
        <mesh position={[3.18, 0, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <Glow color="#FF6A5A" emissive="#FF3B2F" off={0.3} on={2.6} />
        </mesh>
      </group>
    </group>
  );
}
