"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { Matte } from "../Matte";
import { Kit } from "./Kit";

const INK = palette.ink;
const HULL = palette.canopyRed;
const TRIM = palette.cream;

interface PlaneProps {
  /** 0 = tail ramp closed, 1 = fully open. */
  rampOpen: () => number;
}

/**
 * Cut-away jump plane: no roof and a low near wall, so the iso camera sees inside like
 * a dollhouse. Origin = cabin floor at the centre. Nose points -x; the tail ramp is +x.
 */
export function Plane({ rampOpen }: PlaneProps) {
  const ramp = useRef<Group>(null);
  const props = useRef<(Group | null)[]>([]);

  useFrame((_, delta) => {
    if (ramp.current) ramp.current.rotation.z = -1.75 * rampOpen();
    if (!scrollState.reducedMotion) {
      props.current.forEach((p) => {
        if (p) p.rotation.x += delta * 18;
      });
    }
  });

  return (
    <group>
      {/* hull */}
      <RoundedBox args={[6.2, 0.7, 2.1]} position={[-0.9, -0.43, 0]} radius={0.25} castShadow>
        <Matte color={HULL} />
      </RoundedBox>
      {/* cabin floor */}
      <mesh position={[-0.9, -0.05, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.1, 1.8]} />
        <Matte color="#D9A777" />
      </mesh>
      {/* far wall with windows */}
      <RoundedBox args={[6.0, 1.3, 0.16]} position={[-0.9, 0.62, -0.98]} radius={0.06} castShadow>
        <Matte color={TRIM} />
      </RoundedBox>
      {[-2.1, -1.1, -0.1, 0.9].map((x) => (
        <RoundedBox key={x} args={[0.5, 0.36, 0.04]} position={[x, 0.78, -0.88]} radius={0.1}>
          <meshBasicMaterial color={palette.skyTop} />
        </RoundedBox>
      ))}
      {/* low near wall (cut away so we can see in) */}
      <RoundedBox args={[6.0, 0.32, 0.16]} position={[-0.9, 0.12, 0.98]} radius={0.06}>
        <Matte color={TRIM} />
      </RoundedBox>
      {/* low nose cone (below the cockpit floor so the cockpit stays visible) */}
      <mesh position={[-4.0, -0.3, 0]} scale={[0.9, 0.5, 1.0]} castShadow>
        <sphereGeometry args={[1, 20, 14, Math.PI / 2, Math.PI]} />
        <Matte color={HULL} />
      </mesh>

      {/* tail fin above the ramp */}
      <RoundedBox args={[0.9, 1.3, 0.14]} position={[1.75, 1.45, -0.9]} radius={0.06} castShadow>
        <Matte color={HULL} />
      </RoundedBox>
      {/* low wing with two engines */}
      <RoundedBox args={[1.3, 0.14, 8.5]} position={[-1.2, -0.25, 0]} radius={0.06} castShadow>
        <Matte color={TRIM} />
      </RoundedBox>
      {[-2.6, 2.6].map((z, i) => (
        <group key={z} position={[-1.5, -0.15, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 1.1, 14]} />
            <Matte color={HULL} />
          </mesh>
          <group
            ref={(g) => {
              props.current[i] = g;
            }}
            position={[-0.6, 0, 0]}
          >
            <mesh>
              <boxGeometry args={[0.04, 1.2, 0.12]} />
              <Matte color={INK} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.04, 1.2, 0.12]} />
              <Matte color={INK} />
            </mesh>
          </group>
        </group>
      ))}
      {/* tail ramp, hinged at the cabin end */}
      <group ref={ramp} position={[2.0, -0.05, 0]}>
        <mesh position={[0.06, 0.65, 0]} castShadow>
          <boxGeometry args={[0.12, 1.3, 1.8]} />
          <Matte color={TRIM} />
        </mesh>
      </group>

      {/* jump seat along the far wall (the jumpers stand in front of it) */}
      <mesh position={[-0.7, 0.22, -0.78]} castShadow>
        <boxGeometry args={[2.6, 0.12, 0.3]} />
        <Matte color="#B5824F" />
      </mesh>
      {[-1.9, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.1, -0.78]}>
          <boxGeometry args={[0.1, 0.2, 0.26]} />
          <Matte color="#8E6338" />
        </mesh>
      ))}
      <Kit
        name="resource/Textiles_A"
        position={[0.9, 0, -0.62]}
        rotation={[0, 0.5, 0]}
        scale={0.3}
      />

      {/* ---------------- cockpit ---------------- */}
      {/* instrument console */}
      <RoundedBox args={[0.45, 0.4, 1.4]} position={[-3.65, 0.2, 0]} radius={0.05} castShadow>
        <Matte color="#8A8794" />
      </RoundedBox>
      <mesh position={[-3.62, 0.43, 0]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.46, 0.04, 1.3]} />
        <Matte color="#6A6874" />
      </mesh>
      {/* dials facing the pilot */}
      {[-0.45, 0, 0.45].map((z) => (
        <group key={z} position={[-3.42, 0.3, z]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 20]} />
            <Matte color={palette.paper} />
          </mesh>
          <mesh position={[0, 0.017, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.01, 20]} />
            <meshStandardMaterial color="#6FD6E8" emissive="#3AA9C0" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
      {/* control column + yoke */}
      <mesh position={[-3.33, 0.38, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <Matte color={palette.ink} />
      </mesh>
      <mesh position={[-3.27, 0.56, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.55]} />
        <Matte color={palette.ink} />
      </mesh>
      {[-0.27, 0.27].map((z) => (
        <mesh key={z} position={[-3.27, 0.62, z]}>
          <boxGeometry args={[0.05, 0.14, 0.05]} />
          <Matte color={palette.ink} />
        </mesh>
      ))}
      {/* pilot's seat: a tub that hides the legs, plus a seat back and headrest */}
      <RoundedBox args={[0.7, 0.5, 0.78]} position={[-2.85, 0.25, 0]} radius={0.08} castShadow>
        <Matte color="#7C4A38" />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.95, 0.72]} position={[-2.42, 0.62, 0]} radius={0.05} castShadow>
        <Matte color="#7C4A38" />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.22, 0.4]} position={[-2.42, 1.2, 0]} radius={0.06}>
        <Matte color="#8E5A44" />
      </RoundedBox>
      {/* the pilot: hips at the top of the tub, facing forward */}
      <Jumper
        character="knight"
        suitColor={palette.signNavy}
        trimColor={palette.paper}
        gloveColor={palette.paper}
        bootColor={palette.ink}
        rigStyle="wide"
        rigColor={palette.ink}
        rigTrim={palette.canopyTeal}
        pose="stand"
        position={[-2.85, 0.22, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        phase={2.4}
        scale={0.85}
      />
    </group>
  );
}
