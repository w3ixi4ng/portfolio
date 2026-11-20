"use client";

import { Instance, Instances, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Mesh, MeshStandardMaterial, ShaderMaterial, type Group } from "three";
import { daylight } from "@/lib/daylight";
import { scrollState } from "@/lib/scrollState";
import { mulberry32 } from "./CloudField";
import { HazeMaterial } from "./HazeMaterial";
import { kitUrl, preloadKit, type KitName } from "./Kit";

/**
 * The far skyline behind the dropzone (seen from +x,+z), built from CC0 packs:
 *  - Kenney City Kit Commercial: five glass skyscrapers, mid-rise blocks, and the white
 *    "low-detail" silhouettes (made for backdrops) as the hazy back row
 *  - Kenney City Kit Industrial: a district on the right (water tower, chimneys, tanks,
 *    containers, windmills)
 *  - KayKit City Builder: the same buildings used elsewhere, on the left flank
 * Everything is washed toward the horizon colour (more the further back), and a mist wall melts the bases into the ground. Local +x runs along
 * the skyline, +z faces the camera.
 */

/** 0 -> 1 as the skyline fades in (shared by every far building). */
const backdropFade = { value: 0 };

const SKYSCRAPERS = "abcde".split("").map((c): KitName => `commercial/building-skyscraper-${c}`);
const MIDRISE = "abcdefghijkl".split("").map((c): KitName => `commercial/building-${c}`);
const SILHOUETTES: KitName[] = [
  ..."abcdefghijkl".split("").map((c): KitName => `commercial/low-detail-building-${c}`),
  "commercial/low-detail-building-wide-a",
  "commercial/low-detail-building-wide-b",
];
const KAYKIT: KitName[] = [
  "city/building_C",
  "city/building_D",
  "city/building_E",
  "city/building_G",
  "city/building_H",
  "city/building_F",
];

type Scale = number | [number, number, number];

/** One far building: its own material copies, hazed toward the horizon colour. */
function FarBuilding({
  name,
  position,
  scale,
  rotationY = 0,
  haze,
}: {
  name: KitName;
  position: [number, number, number];
  scale: Scale;
  rotationY?: number;
  /** 0 = barely hazed, 1 = nearly lost in it. */
  haze: number;
}) {
  const { scene } = useGLTF(kitUrl(name));
  const group = useRef<Group>(null);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const list: MeshStandardMaterial[] = [];
    c.traverse((o) => {
      if (!(o instanceof Mesh) || !(o.material instanceof MeshStandardMaterial)) return;
      const m = o.material.clone();
      m.fog = false; // too far for scene fog: hazed by hand below
      m.transparent = true; // fades in on the landing approach (backdropFade)
      m.emissive = new Color("#ffffff");
      m.emissiveMap = m.map;
      o.material = m;
      o.castShadow = false;
      list.push(m);
    });
    c.userData.mats = list;
    return c;
  }, [scene]);

  useFrame(() => {
    const list = group.current?.children[0]?.userData.mats as MeshStandardMaterial[] | undefined;
    if (!list) return;
    const fade = backdropFade.value;
    for (const m of list) {
      m.opacity = fade;
      m.color.set("#ffffff").lerp(daylight.horizon, haze * 0.55);
      m.emissive.copy(daylight.horizon);
      m.emissiveIntensity = (0.3 + 0.55 * haze) * (1 - daylight.night * 0.65);
    }
  });

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={obj} />
    </group>
  );
}

interface Spec {
  name: KitName;
  x: number;
  z: number;
  s: Scale;
  rot?: number;
  haze: number;
}

function build(): Spec[] {
  const rand = mulberry32(31);
  const pick = <T,>(a: readonly T[], i: number) => a[i % a.length];
  const out: Spec[] = [];

  // back row: white silhouettes, almost lost in the haze
  for (let i = 0; i < 24; i++) {
    out.push({
      name: pick(SILHOUETTES, i + Math.floor(rand() * 3)),
      x: -96 + i * 8.2 + (rand() - 0.5) * 2.5,
      z: -17 - rand() * 3,
      s: 6 + rand() * 3.2,
      haze: 0.95,
    });
  }
  // the skyscraper cluster
  [
    [4, -29, -7, 5.2],
    [3, -19, -6, 5.0],
    [1, -9, -8, 5.2],
    [4, 1, -6, 5.6],
    [2, 11, -8, 5.0],
    [0, 20, -6, 5.6],
    [3, 29, -7, 4.6],
    [1, 38, -5, 4.2],
  ].forEach(([i, x, z, s]) =>
    out.push({ name: SKYSCRAPERS[i], x, z: z + (rand() - 0.5), s, haze: 0.5 }),
  );
  // mid-rise row across the front of the city
  for (let x = -78, i = 0; x <= 34; x += 6.3, i++) {
    out.push({
      name: pick(MIDRISE, i * 5 + Math.floor(rand() * 3)),
      x: x + (rand() - 0.5) * 1.5,
      z: 1 + rand() * 2,
      s: 4.2 + rand() * 0.9,
      rot: Math.floor(rand() * 4) * (Math.PI / 2),
      haze: 0.32,
    });
  }
  // KayKit buildings on the left flank, in front of the mid-rise row
  for (let i = 0; i < 7; i++) {
    out.push({
      name: pick(KAYKIT, i),
      x: -80 + i * 6.2 + (rand() - 0.5) * 1.5,
      z: 4.6 + rand() * 1.2,
      s: [3.2 + rand() * 1.4, 3.4 + rand() * 3.2, 3.2 + rand() * 1.4],
      haze: 0.3,
    });
  }
  return out;
}

const BUILDINGS = build();

/** Industrial district on the right flank: [name, x, z, scale, rotationY]. */
const INDUSTRIAL: [KitName, number, number, number, number][] = [
  ["industrial/building-a", 40, -1, 4.2, 0],
  ["industrial/building-c", 47, 0, 4.2, 0],
  ["industrial/building-e", 55, -2, 4.2, 0],
  ["industrial/building-h", 63, 0, 4.2, 0],
  ["industrial/building-k", 71, -1, 4.2, 0],
  ["industrial/water-tower", 44, -7, 4.6, 0],
  ["industrial/chimney-large", 52, -8, 5.2, 0],
  ["industrial/chimney-basic", 59, -9, 5.2, 0],
  ["industrial/chimney-medium", 67, -8, 5.2, 0],
  ["industrial/detail-tank-large", 49, 5, 3.4, 0],
  ["industrial/detail-tank-large", 57, 5.4, 3.4, 0.6],
  ["industrial/shipping-container-a", 65, 5, 4.4, 0.2],
  ["industrial/shipping-container-b", 67.5, 5.4, 4.4, -0.1],
  ["industrial/shipping-container-c", 70, 5, 4.4, 0.3],
  ["industrial/windmill", 76, -6, 5.6, 0],
  ["industrial/windmill", 82, -2, 5.6, 0.4],
  ["industrial/solar-panel-landscape-group", 77, 4, 4.4, 0],
];

preloadKit([...SKYSCRAPERS, ...MIDRISE, ...SILHOUETTES, ...KAYKIT, ...INDUSTRIAL.map((i) => i[0])]);

const trees = (() => {
  const r = mulberry32(5);
  return Array.from({ length: 46 }, (_, i) => ({
    x: -78 + i * 3.4 + (r() - 0.5) * 2,
    z: 7 + r() * 4,
    s: 1.5 + r() * 1.3,
  }));
})();

/** Trees in the haze: a park treeline along the skyline's foot, washed toward the horizon colour. */
function Treeline() {
  return (
    <Instances limit={trees.length} range={trees.length} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <HazeMaterial color="#7C9A62" amount={0.88} />
      {trees.map((t, i) => (
        <Instance
          key={i}
          position={[t.x, t.s * 0.45, t.z]}
          scale={[t.s * 1.15, t.s * 0.75, t.s * 1.15]}
        />
      ))}
    </Instances>
  );
}

const hazeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const hazeFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    // Opaque at the ground, melting away upward: buildings rise out of the mist.
    float a = pow(1.0 - vUv.y, 1.6) * 0.95;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

/** A wall of horizon-coloured mist in front of the skyline's base. */
function HazeWall() {
  const mat = useRef<ShaderMaterial>(null);
  useFrame(() => {
    mat.current?.uniforms.uColor.value.copy(daylight.horizon);
  });
  return (
    <mesh position={[0, 10, 13]} renderOrder={2}>
      <planeGeometry args={[260, 20]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        fog={false}
        uniforms={{ uColor: { value: new Color("#F4CFA4") } }}
        vertexShader={hazeVertex}
        fragmentShader={hazeFragment}
      />
    </mesh>
  );
}

/** The whole backdrop, placed behind the dropzone along the camera's far diagonal. */
export function CityBackdrop() {
  const root = useRef<Group>(null);
  // Only for the landing approach: seen from above during the jump it is just flat rows.
  useFrame(() => {
    // Fade in over the landing approach (from above during the jump it is just flat rows).
    const k = Math.min(1, Math.max(0, (scrollState.current - 0.84) / 0.07));
    backdropFade.value = k * k * (3 - 2 * k);
    if (root.current) root.current.visible = backdropFade.value > 0.001;
  });
  return (
    <group ref={root} visible={false} position={[-54, 0, -54]} rotation={[0, Math.PI / 4, 0]}>
      {BUILDINGS.map((b, i) => (
        <FarBuilding
          key={i}
          name={b.name}
          position={[b.x, 0, b.z]}
          scale={b.s}
          rotationY={b.rot}
          haze={b.haze}
        />
      ))}
      {INDUSTRIAL.map(([name, x, z, s, rot], i) => (
        <FarBuilding
          key={`i${i}`}
          name={name}
          position={[x, 0, z]}
          scale={s}
          rotationY={rot}
          haze={0.35}
        />
      ))}
      <Treeline />
      <HazeWall />
    </group>
  );
}
