"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Color, Matrix4, type Fog, type ShaderMaterial } from "three";
import { daylight } from "@/lib/daylight";
import { altitudeFromScroll, lerp } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { skyStops } from "@/lib/theme";
import { CloudField } from "./props/CloudField";
import { haze } from "./props/distanceHaze";

/** Full-screen quad drawn behind everything (works with the orthographic camera). */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform float uNight;
  uniform float uGlow;
  uniform mat4 uInvViewProj;
  varying vec2 vUv;
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  void main() {
    // Grade by the real view direction, not screen height: everything at or below the
    // horizon is the haze colour, so the ground's far edge melts into the sky.
    vec4 far = uInvViewProj * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
    vec3 dir = normalize(far.xyz / far.w - cameraPosition);
    float h = smoothstep(-0.02, 0.62, dir.y);
    vec3 col = mix(uBottom, uTop, h);
    // Soft sun glow in the upper-left, like late-afternoon light.
    float sun = smoothstep(0.75, 0.0, distance(vUv, vec2(0.18, 0.92)));
    col += vec3(1.0, 0.82, 0.55) * sun * uGlow * (1.0 - uNight);
    // Night: a few soft stars and a moon glow instead of the sun.
    vec2 cell = floor(vUv * vec2(220.0, 130.0));
    float star = step(0.9965, hash(cell)) * smoothstep(0.25, 0.9, vUv.y);
    col += vec3(1.0, 0.97, 0.9) * star * uNight * (0.5 + 0.5 * hash(cell + 7.0));
    float moon = smoothstep(0.55, 0.0, distance(vUv, vec2(0.18, 0.9)));
    col += vec3(0.55, 0.62, 0.9) * moon * 0.22 * uNight;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const stops = skyStops.map((s) => ({
  altitude: s.altitude,
  top: new Color(s.top),
  bottom: new Color(s.bottom),
}));

/** Writes the sky colours for an altitude into `top` / `bottom`. */
function sampleSky(altitude: number, top: Color, bottom: Color) {
  for (let i = 1; i < stops.length; i++) {
    const hi = stops[i - 1];
    const lo = stops[i];
    if (altitude >= lo.altitude || i === stops.length - 1) {
      const k = Math.min(1, Math.max(0, (hi.altitude - altitude) / (hi.altitude - lo.altitude)));
      top.lerpColors(hi.top, lo.top, k);
      bottom.lerpColors(hi.bottom, lo.bottom, k);
      return;
    }
  }
}

/** Altitude-driven sky gradient, matching aerial haze, and cloud puffs. */
export function Sky() {
  const material = useRef<ShaderMaterial>(null);
  const fog = useRef<Fog>(null);
  const [uniforms] = useState(() => ({
    uTop: { value: new Color() },
    uBottom: { value: new Color() },
    uNight: { value: 0 },
    uGlow: { value: 0.18 },
    uInvViewProj: { value: new Matrix4() },
  }));

  useFrame(({ camera }) => {
    const m = material.current;
    if (!m) return;
    (m.uniforms.uInvViewProj.value as Matrix4)
      .copy(camera.matrixWorld)
      .multiply(camera.projectionMatrixInverse);
    const altitude = altitudeFromScroll(scrollState.current);
    // Landing haze fades in below ~1,800 ft (see distanceHaze).
    const k = Math.min(1, Math.max(0, (1800 - altitude) / 1400));
    haze.amount.value = k * k * (3 - 2 * k);
    const top = m.uniforms.uTop.value as Color;
    const bottom = m.uniforms.uBottom.value as Color;
    sampleSky(altitude, top, bottom);
    // Cross-fade to the night palette (indigo up high, a violet glow at the horizon).
    top.lerp(daylight.tintTop, daylight.tintTopAmount);
    bottom.lerp(daylight.tintBottom, daylight.tintBottomAmount);
    daylight.horizon.copy(bottom);
    m.uniforms.uNight.value = daylight.night;
    m.uniforms.uGlow.value = daylight.glow;
    // Aerial haze: the ground is soft and hazy from 13,000 ft and sharpens as you fall.
    if (fog.current) {
      fog.current.color.copy(bottom);
      fog.current.near = lerp(70, 90, altitude / 13000);
      fog.current.far = lerp(320, 420, altitude / 13000);
    }
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#F4CFA4", 70, 330]} />
      <mesh frustumCulled={false} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material}
          depthWrite={false}
          depthTest={false}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <CloudField />
    </>
  );
}
