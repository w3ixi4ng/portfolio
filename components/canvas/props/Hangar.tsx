"use client";

import { RoundedBox } from "@react-three/drei";
import { palette } from "@/lib/theme";
import { Glow } from "../Glow";
import { Matte } from "../Matte";

const R = 2.4; // arch radius
const L = 5; // length (along local z)
const RIBS = 6;
const SHELL = "#D9DED8"; // pale corrugated-metal grey-green, warm enough for the palette

/**
 * Quonset hangar ("Hangar-01 (HA)"): ribbed arched shell, front wall with a big sliding
 * door left half-open, a dark interior, a concrete apron. Front faces local +z; origin
 * at ground centre.
 */
export function Hangar({
  position,
  rotation,
  trim = palette.canopyTeal,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Rib and door colour: tells the three hangars apart. */
  trim?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* concrete apron */}
      <RoundedBox args={[6.2, 0.08, 7.6]} position={[0, 0.04, 1.2]} radius={0.03} receiveShadow>
        <Matte color={palette.terrazzo} roughness={0.95} />
      </RoundedBox>

      {/* arched shell: upper half of a cylinder lying along z */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, L, 40, 1, true, Math.PI / 2, Math.PI]} />
        <Matte color={SHELL} side={2} roughness={0.6} />
      </mesh>
      {/* ribs */}
      {Array.from({ length: RIBS }, (_, i) => (
        <mesh key={i} position={[0, 0.08, -L / 2 + (i * L) / (RIBS - 1)]} castShadow>
          <torusGeometry args={[R + 0.03, 0.05, 6, 40, Math.PI]} />
          <Matte color={trim} roughness={0.55} />
        </mesh>
      ))}

      {/* back wall */}
      <mesh position={[0, 0.08, -L / 2]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[R, 40, 0, Math.PI]} />
        <Matte color={palette.cream} side={2} />
      </mesh>
      {/* front wall: cream half-disc, dark interior behind a big door opening */}
      <mesh position={[0, 0.08, L / 2]}>
        <circleGeometry args={[R, 40, 0, Math.PI]} />
        <Matte color={palette.cream} side={2} />
      </mesh>
      {/* Everything on the front stays inside the arch (height at x is sqrt(R² - x²)). */}
      {/* dark interior behind the big door opening */}
      <mesh position={[0, 0.93, L / 2 + 0.01]}>
        <planeGeometry args={[2.4, 1.7]} />
        <Matte color="#3E3540" roughness={1} />
      </mesh>
      {/* sliding door, half-open over the right side of the opening */}
      <RoundedBox
        args={[1.15, 1.7, 0.08]}
        position={[0.62, 0.93, L / 2 + 0.06]}
        radius={0.03}
        castShadow
      >
        <Matte color={trim} roughness={0.6} />
      </RoundedBox>
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0.62, 0.32 + i * 0.4, L / 2 + 0.11]}>
          <boxGeometry args={[1.05, 0.03, 0.02]} />
          <Matte color={palette.cream} />
        </mesh>
      ))}
      {/* door rail */}
      <mesh position={[0, 1.86, L / 2 + 0.06]}>
        <boxGeometry args={[2.7, 0.07, 0.07]} />
        <Matte color={palette.ink} />
      </mesh>
      {/* little round windows high on the front */}
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 2.08 - Math.abs(x) * 0.2, L / 2 + 0.02]}>
          <circleGeometry args={[0.15, 20]} />
          <meshStandardMaterial color={palette.skyTop} roughness={0.2} />
        </mesh>
      ))}
      {/* door lamps: they glow at night */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.45, L / 2 + 0.14]}>
          <sphereGeometry args={[0.1, 14, 10]} />
          <Glow color="#FFF4DA" emissive="#FFD58A" off={0.1} on={2.8} />
        </mesh>
      ))}
      {/* side office door */}
      <RoundedBox args={[0.42, 0.9, 0.06]} position={[-1.65, 0.53, L / 2 + 0.03]} radius={0.02}>
        <Matte color={palette.canopyRed} />
      </RoundedBox>
    </group>
  );
}
