"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { initialQuality } from "@/lib/quality";
import {
  Vector3,
  type AmbientLight,
  type DirectionalLight,
  type HemisphereLight,
  type Object3D,
} from "three";
import { daylight } from "@/lib/daylight";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { getAvatarPosition } from "./path";

/** Sun height range: high (day) → very low (sunrise / golden hour: long soft shadows). */
const SUN_HIGH = 14;
const SUN_LOWEST = 4.5;

/** Low (~35°) sun from back-left of the camera (design/STYLE.md §3). */
const SUN_OFFSET = new Vector3(-14, 12, -6);

/**
 * Golden-hour key light + cool sky fill. The key light's shadow camera follows the
 * avatar down the stack so every diorama gets soft contact shadows.
 */
export function Lights() {
  const sun = useRef<DirectionalLight>(null);
  const target = useRef<Object3D>(null);
  const hemi = useRef<HemisphereLight>(null);
  const amb = useRef<AmbientLight>(null);
  const focus = useRef(new Vector3()).current;
  // Fixed for the whole session: changing shadow settings or light counts mid-scroll makes
  // three.js recompile every material, which shows up as a black flash.
  const [tier] = useState(() => initialQuality());
  const mapSize = tier === "high" ? 2048 : 1024;

  useEffect(() => {
    if (sun.current && target.current) sun.current.target = target.current;
  }, []);

  useFrame(() => {
    if (!sun.current || !target.current) return;
    getAvatarPosition(scrollState.current, focus);
    focus.x = 0;
    focus.z = 0;
    target.current.position.copy(focus);
    sun.current.position.copy(focus).add(SUN_OFFSET);

    // Time of day (sunrise / day / golden hour / night): colour, strength and sun height.
    const d = daylight;
    sun.current.position.copy(focus).add(SUN_OFFSET).y += 0; // keep base offset
    sun.current.position.y = focus.y + SUN_HIGH + (SUN_LOWEST - SUN_HIGH) * d.sunLow;
    sun.current.intensity = d.sunIntensity;
    sun.current.color.copy(d.sunColor);
    if (hemi.current) {
      hemi.current.intensity = d.hemiIntensity;
      hemi.current.color.copy(d.hemiSky);
      hemi.current.groundColor.copy(d.hemiGround);
    }
    if (amb.current) amb.current.intensity = d.ambient;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#BFD9EA", "#E6CFAF", 1.05]} />
      <ambientLight ref={amb} intensity={0.15} color={palette.cream} />
      <directionalLight
        ref={sun}
        intensity={2.6}
        color={palette.sun}
        castShadow={tier !== "low"}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-radius={8}
        shadow-blurSamples={12}
      />
      <object3D ref={target} />
    </>
  );
}
