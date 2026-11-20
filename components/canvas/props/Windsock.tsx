"use client";

import { useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";

interface WindsockProps {
  position: [number, number, number];
  /** Easter egg: called when poked; the sock then spins and flaps wildly for a moment. */
  onPoke?: () => void;
}

/** Striped windsock on a pole, gently flapping; poke it and it goes wild. */
export function Windsock({ position, onPoke }: WindsockProps) {
  const sock = useRef<Group>(null);
  const wildUntil = useRef(0);
  const poked = useRef(false);
  const [hover, setHover] = useState(false);
  useCursor(hover && !!onPoke);

  useFrame((state) => {
    const s = sock.current;
    if (!s) return;
    const t = state.clock.elapsedTime;
    if (poked.current) {
      poked.current = false;
      wildUntil.current = t + 2.2;
    }
    const wild = t < wildUntil.current;
    if (wild) {
      s.rotation.y += 0.45;
      s.rotation.z = -0.1 + Math.sin(t * 30) * 0.35;
    } else if (!scrollState.reducedMotion) {
      s.rotation.y = Math.sin(t * 0.7) * 0.25;
      s.rotation.z = -0.15 + Math.sin(t * 3.1) * 0.06;
    }
  });

  const poke = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    poked.current = true;
    onPoke?.();
  };

  return (
    <group
      position={position}
      onClick={onPoke ? poke : undefined}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 2.8, 8]} />
        <Matte color={palette.paper} />
      </mesh>
      <group ref={sock} position={[0, 2.6, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0.22 + i * 0.32, 0, 0]}
            rotation={[0, 0, -Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.22 - i * 0.05, 0.26 - i * 0.05, 0.32, 14, 1, true]} />
            <Matte color={i % 2 === 0 ? palette.canopyRed : palette.paper} side={2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
