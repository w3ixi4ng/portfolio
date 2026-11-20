"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import {
  AnimationMixer,
  Color,
  ExtrudeGeometry,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Shape,
  Vector3,
  type AnimationAction,
  type AnimationClip,
  type Bone,
  type Group,
  type Object3D,
} from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { scrollState } from "@/lib/scrollState";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";
import { Kit, kitUrl } from "../props/Kit";
import { Rig, type RigStyle } from "./Rig";
import { CHARACTERS, HIDDEN_PARTS, characterUrl, type CharacterId } from "./roster";

export type JumperPose =
  "stand" | "sit" | "run" | "jump" | "freefall" | "canopy" | "wave" | "sleep" | "drink";

/**
 * Per-frame controls a parent can mutate (no React renders): turn the head, blend the right
 * arm into a wave.
 */
export interface JumperControl {
  /** Head turn around the neck, radians. */
  headYaw: number;
  /** 0 → normal pose, 1 → waving. */
  wave: number;
}

export interface JumperProps {
  character?: CharacterId;
  /** Suit: torso + upper arms/legs. */
  suitColor: string;
  /** Optional helmet; leave out to show the character's own hair. */
  trimColor?: string;
  gloveColor?: string;
  bootColor?: string;
  helmetColor?: string;
  /** Colour of the star on the helmet crown, so the jumper reads from above. */
  emblemColor?: string;
  /** A coffee cup in the right hand. */
  holding?: boolean;
  /** Parachute container: shape, colour and trim (so everyone carries a different bag). */
  rigStyle?: RigStyle;
  rigColor?: string;
  rigTrim?: string;
  pose?: JumperPose;
  /** Phase offset so a crowd doesn't move in sync. */
  phase?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  control?: RefObject<JumperControl>;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  children?: ReactNode;
}

const ANIMS_GENERAL = kitUrl("characters/Rig_Medium_General");
const ANIMS_MOVE = kitUrl("characters/Rig_Medium_MovementBasic");

/** KayKit characters are ≈2.2 units tall; scale them to our chibi height (~1.35). */
const MODEL_SCALE = 1.35 / 2.2;

const CLIP: Record<JumperPose, string> = {
  stand: "Idle_A",
  sit: "Idle_B",
  run: "Running_A",
  jump: "Jump_Start",
  freefall: "Jump_Idle",
  canopy: "Jump_Idle",
  wave: "Idle_A",
  sleep: "Death_A_Pose",
  drink: "Use_Item",
};

/* ---------- multi-colour suit ---------- */

interface Suit {
  primary: string;
  trim: string;
  glove: string;
  boot: string;
}

const vec = (hex: string) => {
  const c = new Color(hex);
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
};

/** Which part of the suit a mesh is, decided from its name. */
const PART = { body: 0, arm: 1, leg: 2 } as const;

const suitCache = new Map<string, MeshStandardMaterial>();

/**
 * Flat-colour jumpsuit material that picks its colour from where on the body a fragment is
 * (bind-pose position): sleeves → forearm trim → gloves, hips → trim, legs → cuffs → boots.
 */
function suitMaterial(part: number, s: Suit) {
  const key = `${part}|${s.primary}|${s.trim}|${s.glove}|${s.boot}`;
  const hit = suitCache.get(key);
  if (hit) return hit;
  const P = vec(s.primary);
  const T = vec(s.trim);
  const G = vec(s.glove);
  const B = vec(s.boot);
  const pick =
    part === PART.body
      ? `diffuseColor.rgb = vSuitPos.y < 0.56 ? ${T} : ${P};`
      : part === PART.arm
        ? `float ax = abs(vSuitPos.x); diffuseColor.rgb = ax < 0.6 ? ${P} : (ax < 0.8 ? ${T} : ${G});`
        : `float ly = vSuitPos.y; diffuseColor.rgb = ly > 0.3 ? ${P} : (ly > 0.2 ? ${T} : ${B});`;
  const m = new MeshStandardMaterial({
    color: "#ffffff",
    roughness: part === PART.leg ? 0.85 : 0.72,
  });
  m.customProgramCacheKey = () => `suit-${key}`;
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSuitPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSuitPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSuitPos;")
      .replace("#include <color_fragment>", `#include <color_fragment>\n${pick}`);
  };
  suitCache.set(key, m);
  return m;
}

/* ---------- emblem ---------- */

/** Five-point star, extruded a hair so it catches light. Built once and shared. */
function starGeometry() {
  const s = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 1 : 0.45;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false });
  g.center();
  return g;
}
const STAR = starGeometry();

/* ---------- rig ---------- */

interface Rig {
  head: Bone | null;
  chest: Bone | null;
  armR: Bone | null;
  hand: Bone | null;
  mixer: AnimationMixer;
  action: AnimationAction | null;
  clipName: string;
  /** The extra rotations we layered on last frame, so we can undo them before the mixer runs. */
  headApplied: Quaternion;
  armApplied: Quaternion;
}

const tmpPos = new Vector3();
const tmpQuat = new Quaternion();
const tmpQuat2 = new Quaternion();
const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);

/** Copy a bone's world transform into `target`, expressed in `root`'s local space. */
function follow(bone: Object3D, root: Object3D, target: Object3D) {
  bone.getWorldPosition(tmpPos);
  root.worldToLocal(tmpPos);
  target.position.copy(tmpPos);
  bone.getWorldQuaternion(tmpQuat);
  root.getWorldQuaternion(tmpQuat2).invert();
  target.quaternion.copy(tmpQuat2.multiply(tmpQuat));
}

/** A private skinned clone, dressed as a skydiver. */
function dress(scene: Object3D, suit: Suit) {
  const m = cloneSkinned(scene);
  m.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.castShadow = true;
    o.frustumCulled = false; // skinned bounds don't follow the pose
    if (HIDDEN_PARTS.test(o.name)) o.visible = false;
    else if (/Body$/i.test(o.name)) o.material = suitMaterial(PART.body, suit);
    else if (/Arm/i.test(o.name)) o.material = suitMaterial(PART.arm, suit);
    else if (/Leg/i.test(o.name)) o.material = suitMaterial(PART.leg, suit);
  });
  m.scale.setScalar(MODEL_SCALE);
  return m;
}

/**
 * Chibi skydiver (design/STYLE.md §6) built on the CC0 KayKit Adventurers: each character keeps
 * its own face, dressed in a multi-colour jumpsuit with gloves and boots, plus our helmet,
 * goggles and a parachute rig. Origin at the feet; faces +z.
 */
export function Jumper({
  character = "rogue",
  suitColor,
  trimColor = palette.paper,
  gloveColor = palette.ink,
  bootColor = palette.terracottaDeep,
  helmetColor,
  emblemColor,
  holding,
  rigStyle = "round",
  rigColor = palette.terracottaDeep,
  rigTrim = palette.paper,
  pose = "stand",
  phase = 0,
  position,
  rotation,
  scale = 1,
  control,
  onClick,
  children,
}: JumperProps) {
  const { scene } = useGLTF(characterUrl(character));
  const { animations: general } = useGLTF(ANIMS_GENERAL);
  const { animations: move } = useGLTF(ANIMS_MOVE);

  const root = useRef<Group>(null);
  const headGear = useRef<Group>(null);
  const backGear = useRef<Group>(null);
  const handGear = useRef<Group>(null);
  const rig = useRef<Rig | null>(null);
  const model = useMemo(
    () => dress(scene, { primary: suitColor, trim: trimColor, glove: gloveColor, boot: bootColor }),
    [scene, suitColor, trimColor, gloveColor, bootColor],
  );

  useEffect(() => {
    const mixer = new AnimationMixer(model);
    rig.current = {
      head: (model.getObjectByName("head") as Bone | undefined) ?? null,
      chest: (model.getObjectByName("chest") as Bone | undefined) ?? null,
      armR: (model.getObjectByName("upperarm.r") as Bone | undefined) ?? null,
      hand: (model.getObjectByName("handslot.r") as Bone | undefined) ?? null,
      mixer,
      action: null,
      clipName: "",
      headApplied: new Quaternion(),
      armApplied: new Quaternion(),
    };
    return () => {
      mixer.stopAllAction();
      rig.current = null;
    };
  }, [model]);

  // Cross-fade to the clip for the current pose.
  useEffect(() => {
    const r = rig.current;
    if (!r) return;
    const clips: AnimationClip[] = [...general, ...move];
    const find = (n: string) => clips.find((c) => c.name === n);
    const play = (name: string, once: boolean, then?: string) => {
      const clip = find(name);
      if (!clip) return;
      const next = r.mixer.clipAction(clip);
      next.reset();
      next.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
      next.clampWhenFinished = once;
      next.fadeIn(0.25).play();
      if (!once) next.time = (phase * 0.37) % clip.duration;
      if (r.action && r.action !== next) r.action.fadeOut(0.25);
      r.action = next;
      r.clipName = name;
      if (once && then) {
        const done = (e: { action: AnimationAction }) => {
          if (e.action !== next) return;
          r.mixer.removeEventListener("finished", done);
          play(then, false);
        };
        r.mixer.addEventListener("finished", done);
      }
    };
    if (pose === "jump") play("Jump_Start", true, "Jump_Idle");
    else play(CLIP[pose], false);
    if (r.action && pose === "run") r.action.timeScale = 0.85;
  }, [pose, phase, general, move, model]);

  useFrame((_, delta) => {
    const r = rig.current;
    const g = root.current;
    if (!r || !g) return;

    // Undo last frame's layered rotations first. If the clip keys that bone the mixer
    // overwrites it anyway; if it doesn't, this stops the extra turn from accumulating.
    if (r.head) r.head.quaternion.multiply(tmpQuat.copy(r.headApplied).invert());
    if (r.armR) r.armR.quaternion.multiply(tmpQuat.copy(r.armApplied).invert());

    r.mixer.update(scrollState.reducedMotion ? 0 : delta);

    // Layer the head turn and wave on top of the clip.
    const headYaw = control?.current.headYaw ?? 0;
    r.headApplied.setFromAxisAngle(Y_AXIS, headYaw);
    if (r.head) r.head.quaternion.multiply(r.headApplied);

    const waving = pose === "wave" ? 1 : (control?.current.wave ?? 0);
    if (waving > 0.01) {
      const t = performance.now() / 1000 + phase;
      const lift = waving * (2.4 + Math.sin(t * 8) * 0.3);
      r.armApplied.setFromAxisAngle(Z_AXIS, -lift);
    } else {
      r.armApplied.identity();
    }
    if (r.armR) r.armR.quaternion.multiply(r.armApplied);

    g.updateMatrixWorld(true);
    if (r.head && headGear.current) follow(r.head, g, headGear.current);
    if (r.chest && backGear.current) follow(r.chest, g, backGear.current);
    if (r.hand && handGear.current) {
      // Position only: the cup stays upright whatever the hand does.
      r.hand.getWorldPosition(tmpPos);
      g.worldToLocal(tmpPos);
      handGear.current.position.copy(tmpPos);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale} onClick={onClick}>
      <group ref={root}>
        <primitive object={model} />

        {/* helmet, goggles, emblem : follows the head bone */}
        <group ref={headGear}>
          <group position={[0, 0.3, 0.02]}>
            {/* optional helmet: without one, the character's own hair shows */}
            {helmetColor && (
              <mesh position={[0, 0.02, -0.02]} scale={[1.12, 1, 1.14]} castShadow>
                <sphereGeometry args={[0.31, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <Matte color={helmetColor} roughness={0.5} />
              </mesh>
            )}
            <mesh position={[0, 0.07, 0.31]} rotation={[-0.4, 0, 0]}>
              <boxGeometry args={[0.4, 0.08, 0.06]} />
              <Matte color={palette.ink} />
            </mesh>
            {[-0.09, 0.09].map((x) => (
              <mesh key={x} position={[x, 0.08, 0.34]} rotation={[Math.PI / 2 - 0.4, 0, 0]}>
                <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
                <meshStandardMaterial color={palette.skyTop} roughness={0.15} />
              </mesh>
            ))}
            {emblemColor && helmetColor && (
              <>
                {/* one star on the crown: what you see from above in freefall */}
                <mesh
                  geometry={STAR}
                  position={[0, 0.34, -0.02]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={0.12}
                >
                  <Matte color={emblemColor} roughness={0.5} />
                </mesh>
              </>
            )}
          </group>
        </group>

        {/* parachute container on the back: follows the chest bone */}
        {/* a cup in the right hand while having a kopi */}
        <group ref={handGear} visible={!!holding}>
          <Kit name="kenney/cup-coffee" scale={0.9} />
        </group>

        <group ref={backGear}>
          <Rig style={rigStyle} color={rigColor} trim={rigTrim} />
        </group>

        {children}
      </group>
    </group>
  );
}

for (const id of Object.keys(CHARACTERS) as CharacterId[]) useGLTF.preload(characterUrl(id));
useGLTF.preload(ANIMS_GENERAL);
useGLTF.preload(ANIMS_MOVE);
