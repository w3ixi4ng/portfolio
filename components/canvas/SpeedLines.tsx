"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Object3D, Vector3, type InstancedMesh } from "three";
import { getZone } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { mulberry32 } from "./props/CloudField";
import { getAvatarPosition } from "./path";

const COUNT = 70;
const COLUMN = 18; // height of the band of streaks around the avatar
const SPEED = 9;

const rand = mulberry32(77);
const SEEDS = Array.from({ length: COUNT }, () => {
  const a = rand() * Math.PI * 2;
  const r = 1.8 + rand() * 8;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, phase: rand(), len: 0.8 + rand() * 1.4 };
});

/**
 * Wind streaks rushing up past the avatar toward the camera during freefall
 * (CLAUDE.md §4). Off with reduced motion and outside freefall.
 */
export function SpeedLines() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useRef(new Object3D()).current;
  const avatar = useRef(new Vector3()).current;
  const from = getZone("freefall").start + 0.01;
  const to = getZone("deployment").start;

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const t = scrollState.current;
    m.visible = !scrollState.reducedMotion && t > from && t < to;
    if (!m.visible) return;

    getAvatarPosition(t, avatar);
    const time = state.clock.elapsedTime;
    SEEDS.forEach((s, i) => {
      const y = (((s.phase * COLUMN + time * SPEED) % COLUMN) + COLUMN) % COLUMN;
      dummy.position.set(avatar.x + s.x, avatar.y - COLUMN / 2 + y, avatar.z + s.z);
      dummy.scale.set(1, s.len, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <cylinderGeometry args={[0.012, 0.012, 1.6, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  );
}
