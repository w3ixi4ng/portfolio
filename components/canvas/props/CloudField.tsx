"use client";

import { Instance, Instances } from "@react-three/drei";
import { MeshStandardMaterial } from "three";
import { palette } from "@/lib/theme";

interface Puff {
  position: [number, number, number];
  scale: [number, number, number];
}

/** Small deterministic PRNG so props land in the same place on server and client. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLOUD_COUNT = 38;
const MIN_Y = 14;
const MAX_Y = 136;

/**
 * Puffy flat-bottomed clouds around the fall column. Some sit close to the column so they
 * pass right by (and fade out at) the camera on the way down (CLAUDE.md §4).
 */
function buildPuffs(): Puff[] {
  const rand = mulberry32(13000);
  const puffs: Puff[] = [];
  for (let c = 0; c < CLOUD_COUNT; c++) {
    const y = MIN_Y + ((MAX_Y - MIN_Y) * (c + rand())) / CLOUD_COUNT;
    const angle = rand() * Math.PI * 2;
    // Keep the plane's airspace clear so the hero scene isn't hidden.
    const radius = (y > 118 ? 9 : 5.5) + rand() * 15;
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const size = 0.7 + rand() * 0.9;
    const lumps = 3 + Math.floor(rand() * 3);
    for (let l = 0; l < lumps; l++) {
      const middle = 1 - Math.abs(l - (lumps - 1) / 2) / lumps;
      const s = size * (0.6 + middle * 0.6);
      puffs.push({
        position: [
          cx + (l - (lumps - 1) / 2) * size * 0.75,
          y + s * 0.25,
          cz + (rand() - 0.5) * size * 0.6,
        ],
        scale: [s, s * 0.7, s],
      });
    }
  }
  // A cloud deck just under the plane (seen below it, fallen through on exit). The fall
  // column stays open so the ground shows through the hole.
  const clump = (cx: number, y: number, cz: number, size: number) => {
    const lumps = 3 + Math.floor(rand() * 3);
    for (let l = 0; l < lumps; l++) {
      const middle = 1 - Math.abs(l - (lumps - 1) / 2) / lumps;
      const s = size * (0.6 + middle * 0.6);
      puffs.push({
        position: [
          cx + (l - (lumps - 1) / 2) * size * 0.75,
          y + s * 0.25,
          cz + (rand() - 0.5) * size * 0.8,
        ],
        scale: [s, s * 0.6, s],
      });
    }
  };
  for (let c = 0; c < 70; c++) {
    const angle = rand() * Math.PI * 2;
    const radius = 7 + Math.sqrt(rand()) * 38;
    clump(Math.cos(angle) * radius, 113 + rand() * 4, Math.sin(angle) * radius, 1.4 + rand() * 1.4);
  }
  // A few big puffs drifting level with the plane, off to the sides.
  for (let c = 0; c < 8; c++) {
    const angle = (c / 8) * Math.PI * 2 + rand() * 0.4;
    const radius = 9 + rand() * 6;
    clump(Math.cos(angle) * radius, 125 + rand() * 7, Math.sin(angle) * radius, 1.3 + rand() * 0.8);
  }
  return puffs;
}

const PUFFS = buildPuffs();

/**
 * Soft matte cloud material that fades to transparent near the camera, so clouds the
 * camera falls through dissolve instead of popping (CLAUDE.md §4).
 */
const cloudMaterial = new MeshStandardMaterial({
  color: "#ffffff",
  // A little self-light keeps the shaded side airy instead of muddy peach.
  emissive: palette.cloud,
  emissiveIntensity: 0.28,
  roughness: 1,
  transparent: true,
  depthWrite: false,
});
cloudMaterial.onBeforeCompile = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <alphamap_fragment>",
    `#include <alphamap_fragment>
     diffuseColor.a *= smoothstep(8.0, 18.0, length(vViewPosition));`,
  );
};

/** Instanced cloud field from ~1,400 ft up past the plane. */
export function CloudField() {
  return (
    <Instances
      limit={PUFFS.length}
      range={PUFFS.length}
      material={cloudMaterial}
      // Bounds come from the unit sphere at the origin, so it would be culled whenever the
      // origin (the dropzone) is off-screen, e.g. up at the plane.
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 16, 12]} />
      {PUFFS.map((p, i) => (
        <Instance key={i} position={p.position} scale={p.scale} />
      ))}
    </Instances>
  );
}
