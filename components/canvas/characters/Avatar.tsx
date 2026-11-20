"use client";

import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef, useState } from "react";
import { Vector3, type Group } from "three";
import { profile } from "@/content";
import { getZone } from "@/lib/scroll";
import { palette } from "@/lib/theme";
import { onScrollFrame, scrollState } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";
import { AvatarHint } from "@/components/ui/world/AvatarHint";
import { sfx } from "@/lib/sound";
import { WALK_SPEED, walk } from "@/lib/walk";
import { useEgg } from "../useEgg";
import { ISLANDS } from "../islandLayout";
import { WorldHtml } from "../WorldHtml";
import { EggButton } from "@/components/ui/world/EggButton";
import { useBlip } from "../useBlip";
import { EXIT, getAvatarPosition } from "../path";
import { PLAZA } from "../hangarLayout";
import { startDrinking } from "../requestWalk";
import { Jumper, type JumperControl, type JumperPose } from "./Jumper";

/** stand → run (to the ramp) → jump (the leap) → freefall → canopy → landed. */
type Phase = "stand" | "run" | "jump" | "freefall" | "canopy" | "landed";

const LANDED_AT = 0.985;

function phaseFor(t: number): Phase {
  if (t < EXIT.walk) return "stand";
  if (t < EXIT.door) return "run";
  if (t < EXIT.belly) return "jump";
  if (t < getZone("deployment").start) return "freefall";
  if (t < LANDED_AT) return "canopy";
  return "landed";
}

const POSE: Record<Phase, JumperPose> = {
  stand: "stand",
  run: "run",
  jump: "jump",
  freefall: "freefall",
  canopy: "canopy",
  landed: "wave",
};

/** Body orientation as [pitch, yaw] (Euler order YXZ). KayKit characters face +z. */
const TOWARD_CAMERA: [number, number] = [0, Math.PI / 4];
const TOWARD_DOOR: [number, number] = [0, Math.PI / 2]; // +x: the ramp
/** Belly-to-earth with the head toward −z, i.e. up the screen in the top-down view. */
const BELLY: [number, number] = [Math.PI / 2, Math.PI];

/** Every PEEK_EVERY seconds, look up at the camera and wave for PEEK_FOR. */
const PEEK_EVERY = 7;
const PEEK_FOR = 1.8;

/** "Me": the only one who jumps out of the plane. Pose and orientation change by phase. */
export function Avatar() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const barrel = useRef<Group>(null);
  const control = useRef<JumperControl>({ headYaw: 0, wave: 0 });
  const pos = useRef(new Vector3()).current;
  const [phase, setPhase] = useState<Phase>("stand");
  const activeZone = useAppStore((s) => s.activeZone);
  const walking = useAppStore((s) => s.walking);
  // After landing, clicking a hangar makes me walk there (run animation while moving).
  const drinking = useAppStore((s) => s.drinking);
  const pose: JumperPose =
    phase === "landed" && walking ? "run" : phase === "landed" && drinking ? "drink" : POSE[phase];
  const [islandIndex, setIslandIndex] = useState(-1);
  const [atPlaza, setAtPlaza] = useState(true);
  const atPlazaRef = useRef(true);
  const [twisting, setTwisting] = useState(false);
  const [reserveOn, showReserve] = useBlip(3800);
  const reserve = useAppStore((s) => s.reserve);
  const [hoverMe, setHoverMe] = useState(false);
  useCursor(hoverMe && phase === "canopy" && !reserve);
  const twistPending = useRef(false);
  const twistAt = useRef(-10);
  const phaseNow = useRef<Phase | null>(null);
  const pokeRef = useRef<() => void>(() => {});
  const egg = useEgg();
  const island = islandIndex >= 0 ? ISLANDS[islandIndex] : null;

  // setState only when the phase actually changes (never per frame).
  useEffect(() => {
    let last: Phase | null = null;
    return onScrollFrame((t) => {
      const next = phaseFor(t);
      if (next === last) return;
      if (next === "canopy" && last === "freefall") {
        sfx.canopy();
        // Easter egg #6: line twists (1 in 3) right after opening, which end in a reserve
        // ride (cutaway). `?twists` forces it in dev.
        const force =
          process.env.NODE_ENV !== "production" && window.location.search.includes("twists");
        if (force || Math.random() < 1 / 3) {
          twistPending.current = true;
          setTwisting(true);
          egg("line-twists");
        }
      }
      if (next !== "canopy" && next !== "landed" && useAppStore.getState().reserve)
        useAppStore.getState().setReserve(false);
      last = next;
      phaseNow.current = next;
      setPhase(next);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- egg() is stable
  }, []);

  useEffect(() => {
    if (!twisting) return;
    const t = window.setTimeout(() => {
      setTwisting(false);
      // The twists didn't clear: cut away and ride the reserve (still under canopy only).
      if (phaseNow.current === "canopy" && !useAppStore.getState().reserve) pokeRef.current();
    }, 2600);
    return () => window.clearTimeout(t);
  }, [twisting]);

  // Closing a hangar's panel sends me back out to the middle of the plaza.
  useEffect(() => {
    return useAppStore.subscribe((state, prev) => {
      if (!prev.panel || state.panel || !walk.has || walk.queue.length) return;
      if (Math.hypot(walk.x - PLAZA[0], walk.z - PLAZA[1]) < 1.2) return;
      walk.queue = [[PLAZA[0], PLAZA[1]]];
      walk.section = null;
    });
  }, []);

  const poke = () => {
    if (useAppStore.getState().reserve) return;
    sfx.canopy();
    egg("reserve");
    showReserve();
    useAppStore.getState().setReserve(true);
  };
  useEffect(() => {
    pokeRef.current = poke;
  });

  // Which project island we're passing (for the "tap this" hint). Change-only updates.
  useEffect(() => {
    const p = new Vector3();
    let last = -2;
    return onScrollFrame((t) => {
      const y = getAvatarPosition(t, p).y;
      const next = ISLANDS.findIndex((isl) => y - isl.position[1] > -2 && y - isl.position[1] < 9);
      if (next !== last) {
        last = next;
        setIslandIndex(next);
      }
    });
  }, []);

  useFrame((state, delta) => {
    const r = root.current;
    const b = body.current;
    if (!r || !b) return;
    const t = scrollState.current;
    getAvatarPosition(t, pos);

    // Click-to-walk (lib/walk.ts): once landed I move on the ground myself.
    if (phase === "landed") {
      if (!walk.has) {
        walk.has = true;
        walk.x = pos.x;
        walk.z = pos.z;
        walk.queue = [];
        walk.section = null;
      }
      const next = walk.queue[0];
      if (next) {
        const dx = next[0] - walk.x;
        const dz = next[1] - walk.z;
        const dist = Math.hypot(dx, dz);
        const step = WALK_SPEED * delta;
        if (dist <= step) {
          walk.x = next[0];
          walk.z = next[1];
          walk.queue.shift();
          if (!walk.queue.length && walk.section) {
            const where = walk.section;
            walk.section = null;
            if (where === "kopi") {
              // Arrived at the stall: face the counter, have a drink, then head back out.
              if (walk.face !== null) walk.yaw = walk.face;
              startDrinking();
            } else {
              // Arrived: open that hangar's panel.
              useAppStore.getState().openPanel({ kind: "hub", section: where });
            }
          }
        } else {
          walk.x += (dx / dist) * step;
          walk.z += (dz / dist) * step;
          walk.yaw = Math.atan2(dx, dz);
        }
      }
      const moving = walk.queue.length > 0;
      if (moving !== useAppStore.getState().walking) useAppStore.getState().setWalking(moving);
      // The "touched down" bubble belongs to the plaza; away from it, it stays quiet.
      const here = Math.hypot(walk.x - PLAZA[0], walk.z - PLAZA[1]) < 0.7;
      if (here !== atPlazaRef.current) {
        atPlazaRef.current = here;
        setAtPlaza(here);
      }
      pos.x = walk.x;
      pos.z = walk.z;
    } else if (walk.has) {
      // Scrolled back up: hand control back to the jump path.
      walk.has = false;
      walk.queue = [];
      walk.section = null;
      if (useAppStore.getState().walking) useAppStore.getState().setWalking(false);
    }
    r.position.copy(pos);

    // Belly-down only once we've actually left the ramp.
    const falling = phase === "freefall" || (phase === "jump" && t > EXIT.leap);
    const [pitch, yaw]: [number, number] = falling
      ? BELLY
      : phase === "landed" && (walking || drinking)
        ? [0, walk.yaw]
        : phase === "run" || phase === "jump"
          ? TOWARD_DOOR
          : TOWARD_CAMERA;
    const roll =
      phase === "freefall" && !scrollState.reducedMotion
        ? Math.sin(state.clock.elapsedTime * 0.8) * 0.08
        : 0;
    b.rotation.order = "YXZ";
    if (scrollState.reducedMotion) b.rotation.set(pitch, yaw, roll);
    else easing.dampE(b.rotation, [pitch, yaw, roll], 0.25, delta);
    // Belly-down pivots at the feet; lift so the body centres on the fall line.
    b.position.y = falling ? 0.6 : 0;

    // The "look up and wave" moment: turn the head toward the camera overhead and wave.
    // Only the head and one arm move (no body roll), so it never looks like a spin.
    const cycle = state.clock.elapsedTime % PEEK_EVERY;
    const peek =
      phase === "freefall" && !scrollState.reducedMotion && cycle < PEEK_FOR
        ? Math.sin((cycle / PEEK_FOR) * Math.PI)
        : 0;
    control.current.headYaw = -peek * 1.1;
    control.current.wave = peek;

    // Line twists: a few comic spins that ease out and steady.
    if (twistPending.current) {
      twistPending.current = false;
      twistAt.current = state.clock.elapsedTime;
    }
    const tk = Math.min(1, (state.clock.elapsedTime - twistAt.current) / 2.2);
    const twist = phase === "canopy" && tk < 1 ? Math.PI * 6 * (1 - (1 - tk) ** 3) : 0;
    if (barrel.current) barrel.current.rotation.y = twist;
  }, -4);

  return (
    <group ref={root}>
      <group ref={body}>
        <group
          ref={barrel}
          onClick={(e) => {
            if (phase !== "canopy" || reserve) return;
            e.stopPropagation();
            poke();
          }}
          onPointerOver={() => setHoverMe(true)}
          onPointerOut={() => setHoverMe(false)}
        >
          <Jumper
            // The Rogue is clean-shaven.
            character="rogue"
            suitColor={profile.avatar.suitColor}
            trimColor={palette.paper}
            gloveColor={palette.canopyRed}
            bootColor={palette.terracottaDeep}
            helmetColor={palette.canopyRed}
            emblemColor={palette.canopyYellow}
            rigStyle="pack"
            rigColor={palette.canopyRed}
            rigTrim={palette.canopyYellow}
            pose={pose}
            holding={drinking && phase === "landed"}
            control={control}
          />
        </group>
      </group>

      {/* Easter egg: pop the reserve (click me under canopy) */}
      <WorldHtml position={[0, 0.2, 0]} visible={phase === "canopy" && !reserve}>
        <EggButton label="Cut away and pop the reserve" onClick={poke} />
      </WorldHtml>

      {/* Hint bubble: above the head on screen in top-down, above the helmet when upright. */}
      <WorldHtml position={[0, 0.7, -1.3]} visible={phase === "freefall"}>
        <AvatarHint zone={activeZone} landed={false} island={island} egg={null} />
      </WorldHtml>
      <WorldHtml
        // Under canopy the bubble floats right above me, clear of the wing (canopy top ≈ 3 up).
        position={phase === "canopy" ? [0, 3.5, 0] : [0, 1.5, 0]}
        // On the ground it belongs to the centre of the dropzone only.
        visible={phase === "canopy" || (phase === "landed" && !walking && !drinking && atPlaza)}
      >
        <AvatarHint
          zone={activeZone}
          landed={phase === "landed"}
          island={null}
          egg={reserveOn ? "reserve" : twisting ? "twists" : null}
        />
      </WorldHtml>
      {/* The kopi line is its own bubble, so it never turns into "touched down" while fading. */}
      <WorldHtml position={[0, 1.5, 0]} visible={phase === "landed" && drinking}>
        <AvatarHint zone={activeZone} landed island={null} egg="kopi" />
      </WorldHtml>
    </group>
  );
}
