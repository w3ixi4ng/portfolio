"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette, suitColors } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { Matte } from "../Matte";

/** Bidly island: an auctioneer behind a podium, banging a gavel. */
export function Auctioneer({ position }: { position: [number, number, number] }) {
  const gavel = useRef<Group>(null);
  useFrame((state) => {
    if (!gavel.current || scrollState.reducedMotion) return;
    const t = state.clock.elapsedTime * 3;
    gavel.current.rotation.z = -0.2 - Math.max(0, Math.sin(t)) ** 6 * 1.1;
  });
  return (
    <group position={position}>
      <RoundedBox args={[0.6, 0.45, 0.45]} position={[0, 0.22, 0.35]} radius={0.05} castShadow>
        <Matte color={palette.terracottaDeep} />
      </RoundedBox>
      <Jumper
        character="ranger"
        suitColor={suitColors[4]}
        trimColor={palette.paper}
        gloveColor={palette.ink}
        helmetColor={palette.canopyTeal}
        rigStyle="round"
        rigColor={palette.signNavy}
        rigTrim={palette.canopyYellow}
        pose="stand"
        scale={0.7}
        phase={0.8}
      />
      <group ref={gavel} position={[0.28, 0.62, 0.38]}>
        <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.26, 6]} />
          <Matte color={palette.earth} />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 10]} />
          <Matte color={palette.terracottaDeep} />
        </mesh>
      </group>
    </group>
  );
}
