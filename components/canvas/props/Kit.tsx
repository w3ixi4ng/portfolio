"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial, type Object3D } from "three";
import { distanceHaze, distanceHazeKey } from "./distanceHaze";

/** Every model built by `pnpm models` (scripts/build-models.mjs), as "<folder>/<name>". */
export type KitName = `${
  | "city"
  | "furniture"
  | "resource"
  | "restaurant"
  | "nature"
  | "kenney"
  | "commercial"
  | "industrial"
  | "survival"
  | "car"
  | "characters"
  | "misc"}/${string}`;

export const kitUrl = (name: KitName) => `/models/${name}.glb`;

/** Warm grade (design/STYLE.md §8): nudge every pack toward our palette so they read as one world. */
const WARM = new Color("#FFF1E0");
const graded = new WeakSet<Object3D>();

function grade(scene: Object3D) {
  if (graded.has(scene)) return;
  graded.add(scene);
  scene.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      if (m instanceof MeshStandardMaterial) {
        m.color.multiply(WARM);
        m.roughness = Math.max(m.roughness, 0.7);
        m.metalness = 0;
        // Far from the dropzone, fade into the haze like the ground does.
        m.onBeforeCompile = distanceHaze;
        m.customProgramCacheKey = distanceHazeKey;
      }
    }
  });
}

interface KitProps {
  name: KitName;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

/** One CC0 pack model (meshopt-compressed .glb), cloned so it can be placed many times. */
export function Kit({ name, position, rotation, scale, onClick }: KitProps) {
  const { scene } = useGLTF(kitUrl(name));
  grade(scene);
  return (
    <Clone
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={onClick}
      castShadow
      receiveShadow
    />
  );
}

export const preloadKit = (names: readonly KitName[]) =>
  names.forEach((n) => useGLTF.preload(kitUrl(n)));
