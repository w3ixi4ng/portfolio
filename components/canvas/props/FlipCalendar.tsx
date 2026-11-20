"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

/** Booking System island: a desk calendar flipping pages quickly. */
export function FlipCalendar({ position }: { position: [number, number, number] }) {
  const page = useRef<Group>(null);
  useFrame((state) => {
    if (!page.current || scrollState.reducedMotion) return;
    page.current.rotation.x = -((state.clock.elapsedTime * 2.5) % 1) * Math.PI;
  });
  return (
    <group position={position} rotation={[0, 0.3, 0]}>
      <RoundedBox args={[0.46, 0.5, 0.06]} position={[0, 0.25, 0]} radius={0.02} castShadow>
        <Matte color={palette.paper} />
      </RoundedBox>
      <mesh position={[0, 0.47, 0.035]}>
        <boxGeometry args={[0.46, 0.08, 0.02]} />
        <Matte color={palette.canopyRed} />
      </mesh>
      <group ref={page} position={[0, 0.43, 0.04]}>
        <mesh position={[0, -0.18, 0]}>
          <planeGeometry args={[0.42, 0.36]} />
          <Matte color={palette.cream} side={2} />
        </mesh>
      </group>
    </group>
  );
}
