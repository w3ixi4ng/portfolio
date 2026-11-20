"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { EXIT } from "../path";
import { Matte } from "../Matte";

const INK = palette.ink;
const HULL = palette.canopyRed;
const WALL = palette.cream;
const TRIM = "#E9A47F"; // soft peach trim along the wall tops and portholes
const PLANK_A = "#F3DDB0";
const PLANK_B = "#E9CD9A";
const SEAT = "#6DB3A6";
const DASH = "#3D4160";

/** The cabin runs from the nose centre (x = NOSE_X) back to the ramp hinge (x = 2). */
const NOSE_X = -3.8;
const CABIN_LEN = 5.8;
const CABIN_MID = NOSE_X + CABIN_LEN / 2;
/** Nose radius: matches the wall line (z = ±0.98). */
const NR = 0.98;
const WALL_H = 1.3;

const PLANKS = 6;
const PORTHOLES = [-2.4, -1.5, -0.6, 0.3, 1.2];
const DIALS = [
  { z: -0.42, color: palette.canopyYellow },
  { z: -0.18, color: palette.paper },
  { z: 0.06, color: palette.canopyRed },
  { z: 0.3, color: "#7FD6E8" },
];

interface PlaneProps {
  /** 0 = tail ramp closed, 1 = fully open. */
  rampOpen: () => number;
}

/** A curved wall piece round the nose: thetaStart/Length as in CylinderGeometry (0 = +z). */
function NoseWall({
  from,
  len,
  y,
  h,
  color,
  glass,
}: {
  from: number;
  len: number;
  y: number;
  h: number;
  color: string;
  glass?: boolean;
}) {
  return (
    <mesh position={[NOSE_X, y + h / 2, 0]}>
      <cylinderGeometry args={[NR, NR, h, 28, 1, true, from, len]} />
      {glass ? (
        <meshStandardMaterial
          color="#BFE6F2"
          transparent
          opacity={0.4}
          roughness={0.1}
          depthWrite={false}
          side={2}
        />
      ) : (
        <Matte color={color} side={2} />
      )}
    </mesh>
  );
}

/** Peach rim on top of a curved wall piece (RingGeometry theta: 0 = +x, then toward -z). */
function NoseRim({ from, len, y }: { from: number; len: number; y: number }) {
  return (
    <mesh position={[NOSE_X, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[NR - 0.08, NR + 0.06, 28, 1, from, len]} />
      <Matte color={TRIM} side={2} />
    </mesh>
  );
}

/**
 * Cut-away jump plane, built like a cozy dollhouse: no roof, a low near wall, plank floor,
 * peach-trimmed cream walls with portholes and a rounded glass nose over the cockpit.
 * Origin = cabin floor at the centre. Nose points -x; the tail ramp is +x.
 */
export function Plane({ rampOpen }: PlaneProps) {
  const ramp = useRef<Group>(null);
  const props = useRef<(Group | null)[]>([]);

  const red = useRef<MeshStandardMaterial>(null);
  const green = useRef<MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    // Jump light by the door: red while walking up to it, green when it's go time.
    const go = scrollState.current >= EXIT.door;
    if (red.current) red.current.emissiveIntensity = go ? 0.05 : 2.4;
    if (green.current) green.current.emissiveIntensity = go ? 2.4 : 0.05;
    if (ramp.current) ramp.current.rotation.z = -1.75 * rampOpen();
    if (!scrollState.reducedMotion) {
      props.current.forEach((p) => {
        if (p) p.rotation.x += delta * 18;
      });
    }
  });

  return (
    <group>
      {/* ---------------- hull ---------------- */}
      <RoundedBox
        args={[CABIN_LEN + 0.2, 0.7, 2.1]}
        position={[CABIN_MID + 0.1, -0.43, 0]}
        radius={0.25}
        castShadow
      >
        <Matte color={HULL} />
      </RoundedBox>
      {/* rounded nose: an ellipsoid tucked under the cockpit floor */}
      <mesh position={[NOSE_X, -0.43, 0]} scale={[1.08, 0.36, 1.05]} castShadow>
        <sphereGeometry args={[1, 24, 16]} />
        <Matte color={HULL} />
      </mesh>

      {/* ---------------- floor: planks + a rounded nose piece ---------------- */}
      <mesh position={[CABIN_MID, -0.05, 0]} receiveShadow>
        <boxGeometry args={[CABIN_LEN, 0.1, 1.8]} />
        <Matte color={PLANK_B} />
      </mesh>
      {Array.from({ length: PLANKS }, (_, i) => (
        <mesh
          key={i}
          position={[CABIN_MID, 0.004, -0.9 + (i + 0.5) * (1.8 / PLANKS)]}
          receiveShadow
        >
          <boxGeometry args={[CABIN_LEN, 0.008, 1.8 / PLANKS - 0.025]} />
          <Matte color={i % 2 ? PLANK_A : PLANK_B} />
        </mesh>
      ))}
      <mesh position={[NOSE_X, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.9, 28, Math.PI / 2, Math.PI]} />
        <Matte color={PLANK_A} />
      </mesh>

      {/* ---------------- walls ---------------- */}
      {/* far wall with peach trim and round portholes */}
      <RoundedBox
        args={[CABIN_LEN, WALL_H, 0.16]}
        position={[CABIN_MID, WALL_H / 2 - 0.03, -0.98]}
        radius={0.06}
        castShadow
      >
        <Matte color={WALL} />
      </RoundedBox>
      <RoundedBox
        args={[CABIN_LEN, 0.1, 0.22]}
        position={[CABIN_MID, WALL_H - 0.02, -0.98]}
        radius={0.04}
      >
        <Matte color={TRIM} />
      </RoundedBox>
      {PORTHOLES.map((x) => (
        <group key={x} position={[x, 0.78, -0.89]}>
          <mesh>
            <torusGeometry args={[0.19, 0.045, 10, 24]} />
            <Matte color={TRIM} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.18, 24]} />
            <meshBasicMaterial color={palette.skyTop} />
          </mesh>
        </group>
      ))}
      {/* low near wall (cut away so we can see in) */}
      <RoundedBox args={[CABIN_LEN, 0.32, 0.16]} position={[CABIN_MID, 0.13, 0.98]} radius={0.06}>
        <Matte color={WALL} />
      </RoundedBox>
      <RoundedBox args={[CABIN_LEN, 0.06, 0.22]} position={[CABIN_MID, 0.3, 0.98]} radius={0.03}>
        <Matte color={TRIM} />
      </RoundedBox>

      {/* nose: a full wrap-around windscreen over a low sill, peach rims, slim mullions */}
      <NoseWall from={Math.PI} len={Math.PI} y={-0.02} h={0.55} color={WALL} />
      <NoseWall from={Math.PI} len={Math.PI} y={0.53} h={0.68} color={WALL} glass />
      <NoseRim from={Math.PI / 2} len={Math.PI} y={0.55} />
      <NoseRim from={Math.PI / 2} len={Math.PI} y={WALL_H - 0.02} />
      {[1.2, 1.4, 1.6, 1.8].map((k) => (
        <mesh
          key={k}
          position={[NOSE_X + NR * Math.sin(k * Math.PI), 0.87, NR * Math.cos(k * Math.PI)]}
        >
          <boxGeometry args={[0.07, 0.68, 0.07]} />
          <Matte color={TRIM} />
        </mesh>
      ))}

      {/* ---------------- outside: tail, wings, engines, ramp ---------------- */}
      <RoundedBox args={[0.9, 1.3, 0.14]} position={[1.75, 1.45, -0.9]} radius={0.06} castShadow>
        <Matte color={HULL} />
      </RoundedBox>
      <RoundedBox args={[1.3, 0.14, 8.5]} position={[-1.2, -0.25, 0]} radius={0.06} castShadow>
        <Matte color={WALL} />
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
          <Matte color={WALL} />
        </mesh>
      </group>

      {/* ---------------- cabin ---------------- */}
      {/* jump light on the far wall by the door */}
      <group position={[1.55, 1.13, -0.88]}>
        <RoundedBox args={[0.42, 0.22, 0.06]} radius={0.03}>
          <Matte color={INK} />
        </RoundedBox>
        <mesh position={[-0.1, 0, 0.04]}>
          <sphereGeometry args={[0.07, 14, 10]} />
          <meshStandardMaterial
            ref={red}
            color="#FF5A4A"
            emissive="#FF3B2F"
            emissiveIntensity={2.4}
          />
        </mesh>
        <mesh position={[0.1, 0, 0.04]}>
          <sphereGeometry args={[0.07, 14, 10]} />
          <meshStandardMaterial
            ref={green}
            color="#6BE38A"
            emissive="#2FD05A"
            emissiveIntensity={0.05}
          />
        </mesh>
      </group>
      {/* padded jump bench along the far wall */}
      <RoundedBox args={[2.8, 0.1, 0.34]} position={[-0.6, 0.24, -0.76]} radius={0.04} castShadow>
        <Matte color="#B5824F" />
      </RoundedBox>
      <RoundedBox args={[2.7, 0.08, 0.3]} position={[-0.6, 0.32, -0.76]} radius={0.04}>
        <Matte color={SEAT} />
      </RoundedBox>
      {[-1.85, 0.65].map((x) => (
        <mesh key={x} position={[x, 0.1, -0.76]}>
          <boxGeometry args={[0.1, 0.2, 0.28]} />
          <Matte color="#8E6338" />
        </mesh>
      ))}

      {/* ---------------- cockpit ---------------- */}
      {/* dashboard under the windscreen, its top tilted toward the seats */}
      <RoundedBox args={[0.34, 0.5, 1.2]} position={[-4.22, 0.25, 0]} radius={0.06} castShadow>
        <Matte color={DASH} />
      </RoundedBox>
      <group position={[-4.08, 0.52, 0]} rotation={[0, 0, -0.32]}>
        <RoundedBox args={[0.42, 0.06, 1.24]} radius={0.03}>
          <Matte color={DASH} />
        </RoundedBox>
        {DIALS.map((d) => (
          <mesh key={d.z} position={[0, 0.04, d.z]}>
            <cylinderGeometry args={[0.07, 0.07, 0.03, 18]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={0.25}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
      {/* two yokes */}
      {[-0.38, 0.38].map((z) => (
        <group key={z} position={[-3.86, 0, z]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
            <Matte color={INK} />
          </mesh>
          <RoundedBox args={[0.05, 0.06, 0.32]} position={[0, 0.6, 0]} radius={0.02}>
            <Matte color={INK} />
          </RoundedBox>
        </group>
      ))}
      {/* pilot + co-pilot seats (the right one is empty) */}
      {[-0.38, 0.38].map((z) => (
        <group key={z} position={[-3.42, 0, z]}>
          <RoundedBox args={[0.56, 0.44, 0.52]} position={[0, 0.22, 0]} radius={0.08} castShadow>
            <Matte color={SEAT} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.78, 0.5]} position={[0.3, 0.6, 0]} radius={0.05} castShadow>
            <Matte color={SEAT} />
          </RoundedBox>
        </group>
      ))}
      {/* the pilot: hips at the top of the seat, facing forward */}
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
        position={[-3.42, 0.2, -0.38]}
        rotation={[0, -Math.PI / 2, 0]}
        phase={2.4}
        scale={0.8}
      />
    </group>
  );
}
