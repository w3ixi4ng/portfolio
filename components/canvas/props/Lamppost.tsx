"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { initialQuality } from "@/lib/quality";
import type { PointLight } from "three";
import { daylight } from "@/lib/daylight";
import { palette } from "@/lib/theme";
import { PLAZA } from "../hangarLayout";
import { Glow } from "../Glow";
import { Matte } from "../Matte";

const LAMP = "#FFD58A";

interface LamppostProps {
  position: [number, number, number];
  /** Real point light (a few at most; others just glow). */
  light?: boolean;
}

/** A little iron lamppost whose lamp lights up at night and casts a warm pool of light. */
export function Lamppost({ position, light = true }: LamppostProps) {
  const lamp = useRef<PointLight>(null);
  // Decided once (see Lights.tsx): the light count must not change mid-session.
  const [tier] = useState(() => initialQuality());
  useFrame(() => {
    if (lamp.current) lamp.current.intensity = daylight.night * 7;
  });
  // The lamp arm points along local +x: turn it toward the landing plaza.
  const rotationY = Math.atan2(-(PLAZA[1] - position[2]), PLAZA[0] - position[0]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.17, 0.12, 12]} />
        <Matte color={palette.ink} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 2.2, 10]} />
        <Matte color={palette.ink} />
      </mesh>
      {/* curved arm + lamp head */}
      <mesh position={[0.2, 2.26, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.46, 8]} />
        <Matte color={palette.ink} />
      </mesh>
      <mesh position={[0.46, 2.2, 0]}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <Glow color="#FFF4DA" emissive={LAMP} off={0.12} on={2.8} />
      </mesh>
      <mesh position={[0.46, 2.34, 0]}>
        <coneGeometry args={[0.2, 0.12, 14]} />
        <Matte color={palette.ink} />
      </mesh>
      {light && tier !== "low" && (
        <pointLight
          ref={lamp}
          position={[0.46, 2.1, 0]}
          color={LAMP}
          distance={9}
          decay={1.6}
          intensity={0}
        />
      )}
    </group>
  );
}
