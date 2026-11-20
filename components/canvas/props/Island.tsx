"use client";

import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";
import type { IslandTheme } from "@/content";
import { scrollState } from "@/lib/scrollState";
import { islandColors } from "@/lib/theme";
import { DioramaBase } from "./DioramaBase";
import { IslandDecor } from "./IslandDecor";

interface IslandProps {
  theme: IslandTheme;
  position: [number, number, number];
  phase?: number;
  onSelect: () => void;
}

/** A floating project island: diorama chunk + themed dressing. Click to open the project. */
export function Island({ theme, position, phase = 0, onSelect }: IslandProps) {
  const float = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const c = islandColors[theme];

  useFrame((state, delta) => {
    const g = float.current;
    if (!g) return;
    if (!scrollState.reducedMotion) {
      g.position.y = Math.sin(state.clock.elapsedTime * 0.7 + phase) * 0.12;
    }
    const s = hovered ? 1.05 : 1;
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * Math.min(1, delta * 10));
  });

  return (
    <group position={position}>
      <group
        ref={float}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <DioramaBase radius={2} top={c.top} soil={c.side} />
        <IslandDecor theme={theme} accent={c.accent} />
      </group>
    </group>
  );
}
