"use client";

import { Instance, Instances, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Box3,
  Color,
  Group,
  Mesh,
  type MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  type WebGLProgramParametersWithUniforms,
} from "three";
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
 *    containers)
 *  - KayKit City Builder: the same buildings used elsewhere, on the left flank
 * Everything is washed toward the horizon colour (more the further back), and a mist wall melts the bases into the ground. Local +x runs along
 * the skyline, +z faces the camera.
 */

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
/**
 * 0 -> 1 as the skyline fades in on the landing approach (it belongs to the dropzone view;
 * from up high it would just be rows of rooftops). Shared by every piece of the backdrop.
 */
const fade = { value: 0 };

/** 0 -> 1 with night: how strongly the skyline's windows glow. Shared uniform. */
const windowGlow = { value: 0 };

/**
 * Lights the models' own windows at night: the pack textures paint glass in saturated blues,
 * so texels that are clearly blue (not grey-blue walls or purple trim) glow warm. A hash of
 * the window's world cell decides which flats are home, so it varies per window.
 */
function winLights(shader: WebGLProgramParametersWithUniforms) {
  shader.uniforms.uWindowGlow = windowGlow;
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vWinPos;")
    .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWinPos = transformed;");
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 vWinPos;\nuniform float uWindowGlow;",
    )
    .replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
      #ifdef USE_MAP
        vec3 tex = texture2D(map, vMapUv).rgb;
        // Soft mask, so filtered texel edges fade instead of sparkling.
        float glass = smoothstep(0.12, 0.3, tex.b - tex.r) * smoothstep(-0.06, 0.04, tex.g - tex.r);
        // One cell ~ one flat (object space, so it never shifts as things move).
        vec3 cell = floor(vWinPos / vec3(0.34, 0.2, 0.34));
        vec3 q = fract(cell * vec3(0.1031, 0.1030, 0.0973));
        q += dot(q, q.yxz + 33.33);
        float h = fract((q.x + q.y) * q.z);
        // Flats switch on one by one as night deepens: about a quarter end up lit.
        float home = step(h, uWindowGlow * 0.27);
        // Warm lamps, a few cooler (TV / white light), varied brightness.
        float h2 = fract(h * 7.31);
        vec3 lamp = mix(vec3(1.0, 0.72, 0.38), vec3(0.85, 0.9, 1.0), step(0.8, h2));
        totalEmissiveRadiance += lamp * glass * home * (0.45 + 0.4 * h2);
        diffuseColor.rgb *= 1.0 - glass * (1.0 - home) * uWindowGlow * 0.55;
      #endif`,
    );
}

function FarBuilding({
  name,
  position,
  scale,
  rotationY = 0,
  haze,
  lights = false,
}: {
  name: KitName;
  position: [number, number, number];
  scale: Scale;
  rotationY?: number;
  /** 0 = barely hazed, 1 = nearly lost in it. */
  haze: number;
  /** Lit windows at night (only the proper towers/blocks; not silhouettes or industry). */
  lights?: boolean;
}) {
  const { scene } = useGLTF(kitUrl(name));
  const group = useRef<Group>(null);
  const beacon = useRef<Mesh>(null);
  /** A blinking roof beacon on tall towers (window lights live in the material: winLights). */
  const night = useMemo(() => {
    const probe = new Group();
    const c = scene.clone(true);
    c.rotation.y = rotationY;
    probe.add(c);
    const box = new Box3().setFromObject(probe);
    const h = box.max.y - box.min.y;
    return {
      top: box.max.y,
      cx: (box.min.x + box.max.x) / 2,
      cz: (box.min.z + box.max.z) / 2,
      tall: h > 1.6,
    };
  }, [scene, rotationY]);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    const list: MeshStandardMaterial[] = [];
    c.traverse((o) => {
      if (!(o instanceof Mesh) || !(o.material instanceof MeshStandardMaterial)) return;
      const m = o.material.clone();
      m.fog = false; // too far for scene fog: hazed by hand below
      m.transparent = true; // fades in with the landing approach
      m.emissive = new Color("#ffffff");
      m.emissiveMap = m.map;
      if (lights) {
        m.onBeforeCompile = winLights;
        m.customProgramCacheKey = () => "far-windows";
      }
      o.material = m;
      o.castShadow = false;
      list.push(m);
    });
    c.userData.mats = list;
    return c;
  }, [scene, lights]);

  useFrame(() => {
    const list = group.current?.children[0]?.userData.mats as MeshStandardMaterial[] | undefined;
    if (!list) return;
    const lit = daylight.night * fade.value;
    windowGlow.value = daylight.night;
    if (beacon.current) {
      const blink = Math.sin(performance.now() * 0.004 + position[0]) > 0.4 ? 1 : 0.15;
      beacon.current.visible = lit > 0.02;
      (beacon.current.material as MeshBasicMaterial).opacity = lit * blink;
    }
    for (const m of list) {
      m.opacity = fade.value;
      m.color.set("#ffffff").lerp(daylight.horizon, haze * 0.55);
      m.emissive.copy(daylight.horizon);
      m.emissiveIntensity = (0.3 + 0.55 * haze) * (1 - daylight.night * 0.65);
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={group} rotation={[0, rotationY, 0]}>
        <primitive object={obj} />
      </group>
      {night.tall && (
        <mesh ref={beacon} position={[night.cx, night.top + 0.03, night.cz]} visible={false}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshBasicMaterial
            color="#FF4A3A"
            transparent
            opacity={0}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      )}
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
  lights?: boolean;
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
    out.push({ name: SKYSCRAPERS[i], x, z: z + (rand() - 0.5), s, haze: 0.5, lights: true }),
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
      lights: true,
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
  ["industrial/solar-panel-landscape-group", 77, 4, 4.4, 0],
];

preloadKit([...SKYSCRAPERS, ...MIDRISE, ...SILHOUETTES, ...KAYKIT, ...INDUSTRIAL.map((i) => i[0])]);

const trees = (() => {
  const r = mulberry32(5);
  return Array.from({ length: 46 }, (_, i) => ({
    x: -78 + i * 3.4 + (r() - 0.5) * 2,
    // well behind the mist wall (z = 13) even at full radius, so no crown pokes through it
    z: 4.5 + r() * 2.5,
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
  uniform float uFade;
  uniform float uStrength;
  uniform float uSeed;
  varying vec2 vUv;
  void main() {
    float x = vUv.x * 260.0 + uSeed * 37.0;
    // Billowing top edge (layered waves), never a ruler-straight line.
    float edge = 0.55
      + 0.12 * sin(x * 0.045 + uSeed)
      + 0.07 * sin(x * 0.11 + 2.1 + uSeed * 1.7)
      + 0.04 * sin(x * 0.27 + 4.0);
    float top = 1.0 - smoothstep(edge - 0.45, edge + 0.08, vUv.y);
    // Thin at the very bottom too, so the layer never shows where it meets the ground: the
    // ground's own distance haze carries the fade there.
    float bottom = smoothstep(0.0, 0.3, vUv.y);
    float a = top * bottom * (0.82 + 0.18 * sin(x * 0.07 + vUv.y * 5.0 + uSeed));
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0) * uStrength * uFade);
    #include <colorspace_fragment>
  }
`;

/**
 * Layered mist bands at increasing depth, each soft at the top and the bottom. Stacked, they
 * build up a gradual haze over the far fields and the skyline's base (like real aerial haze),
 * instead of one wall with an edge.
 */
const MIST_LAYERS = [
  { z: 30, height: 7, strength: 0.32, seed: 0.3 },
  { z: 22, height: 11, strength: 0.42, seed: 1.9 },
  { z: 13, height: 18, strength: 0.6, seed: 3.1 },
  { z: 4, height: 26, strength: 0.55, seed: 4.6 },
  { z: -8, height: 34, strength: 0.5, seed: 6.2 },
];

function HazeWall() {
  const mats = useRef<(ShaderMaterial | null)[]>([]);
  useFrame(() => {
    for (const m of mats.current) {
      if (!m) continue;
      m.uniforms.uColor.value.copy(daylight.horizon);
      m.uniforms.uFade.value = fade.value;
    }
  });
  return (
    <>
      {MIST_LAYERS.map((l, i) => (
        <mesh key={l.z} position={[0, l.height / 2 - 0.5, l.z]} renderOrder={2 + i}>
          <planeGeometry args={[300, l.height]} />
          <shaderMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            transparent
            depthWrite={false}
            fog={false}
            uniforms={{
              uColor: { value: new Color("#F4CFA4") },
              uFade: { value: 0 },
              uStrength: { value: l.strength },
              uSeed: { value: l.seed },
            }}
            vertexShader={hazeVertex}
            fragmentShader={hazeFragment}
          />
        </mesh>
      ))}
    </>
  );
}

/** The whole backdrop, placed behind the dropzone along the camera's far diagonal. */
export function CityBackdrop() {
  const root = useRef<Group>(null);
  const trees = useRef<Group>(null);
  useFrame(() => {
    const k = Math.min(1, Math.max(0, (scrollState.current - 0.84) / 0.07));
    fade.value = k * k * (3 - 2 * k);
    if (root.current) root.current.visible = fade.value > 0.001;
    // the treeline grows up out of the ground rather than fading
    if (trees.current) trees.current.scale.y = Math.max(0.001, fade.value);
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
          lights={b.lights}
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
      <group ref={trees}>
        <Treeline />
      </group>
      <HazeWall />
    </group>
  );
}
