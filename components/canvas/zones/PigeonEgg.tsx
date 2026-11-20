"use client";

import { RoundedBox, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group } from "three";
import { EggButton } from "@/components/ui/world/EggButton";
import { EGG_COPY } from "@/components/ui/world/eggCopy";
import { SpeechBubble } from "@/components/ui/world/SpeechBubble";
import { getZone } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { sfx } from "@/lib/sound";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";
import { WorldHtml } from "../WorldHtml";
import { yForAltitude } from "../path";
import { useBlip } from "../useBlip";
import { useEgg } from "../useEgg";
import { useZoneWindow } from "./useZoneWindow";

const PIGEON_AT: [number, number, number] = [-3.6, yForAltitude(8000), 1.4];

/** Easter egg #2: a deeply confused pigeon at 8,000 ft. Click → "coo?". */
export function PigeonEgg() {
  const egg = useEgg();
  const body = useRef<Group>(null);
  const wings = useRef<(Group | null)[]>([]);
  const [hover, setHover] = useState(false);
  const [talking, talk] = useBlip(2500);
  useCursor(hover);
  const { ref } = useZoneWindow(getZone("formation").start - 0.04, getZone("formation").end);

  useFrame((state) => {
    if (scrollState.reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (body.current) body.current.position.y = Math.sin(t * 2) * 0.15;
    wings.current.forEach((w, i) => {
      if (w) w.rotation.z = (i === 0 ? 1 : -1) * (0.3 + Math.sin(t * 18) * 0.6);
    });
  });

  const poke = () => {
    talk();
    sfx.coo();
    egg("pigeon");
  };

  return (
    <group ref={ref} position={PIGEON_AT} scale={1.3}>
      <group
        ref={body}
        rotation={[0, Math.PI / 5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          poke();
        }}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <mesh scale={[0.42, 0.34, 0.6]} castShadow>
          <sphereGeometry args={[1, 18, 14]} />
          <Matte color="#9AA0AA" />
        </mesh>
        <mesh position={[0, 0.28, 0.42]} castShadow>
          <sphereGeometry args={[0.22, 16, 12]} />
          <Matte color="#6E8F86" />
        </mesh>
        {/* big confused eyes, slightly mismatched */}
        {[
          [-0.11, 0.36, 0.6, 0.07],
          [0.11, 0.33, 0.6, 0.055],
        ].map(([x, y, z, r], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[r, 12, 10]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[i ? -0.01 : 0.02, 0, r * 0.7]}>
              <sphereGeometry args={[r * 0.45, 10, 8]} />
              <meshBasicMaterial color={palette.ink} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.24, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.16, 8]} />
          <Matte color={palette.canopyYellow} />
        </mesh>
        {[-1, 1].map((side, i) => (
          <group
            key={side}
            ref={(g) => {
              wings.current[i] = g;
            }}
            position={[side * 0.34, 0.1, 0]}
          >
            <RoundedBox args={[0.6, 0.05, 0.42]} position={[side * 0.3, 0, 0]} radius={0.02}>
              <Matte color="#8A909B" />
            </RoundedBox>
          </group>
        ))}
      </group>
      <WorldHtml position={[0, 0.8, -0.6]} visible={talking}>
        <SpeechBubble>
          <p className="font-bold">{EGG_COPY.pigeon}</p>
        </SpeechBubble>
      </WorldHtml>
      <WorldHtml position={[0, -0.5, 0]} visible={!talking}>
        <EggButton label="Say hi to the pigeon" onClick={poke} />
      </WorldHtml>
    </group>
  );
}
