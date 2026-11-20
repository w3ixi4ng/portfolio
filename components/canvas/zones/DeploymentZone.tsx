"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef } from "react";
import { Vector3, type Group } from "three";
import { experience } from "@/content";
import { WorldSign } from "@/components/ui/world/WorldSign";
import { getZone } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";
import { palette } from "@/lib/theme";
import { Canopy, RESERVE_COLORS } from "../props/Canopy";
import { GroundCanopy } from "../props/GroundCanopy";
import { Matte } from "../Matte";
import { WorldHtml } from "../WorldHtml";
import { avatarAt, getAvatarPosition, spreadInZone } from "../path";
import { useZoneWindow } from "./useZoneWindow";

/** Where I touch down, and where the canopy ends up: on open grass to my left. */
const LAND = avatarAt(0.985);
const HEAP_AT: [number, number, number] = [LAND.x - 1.6, 0, LAND.z + 1.2];
const HEAP_SCALE = 1.0;
/** Local +x of the heap should point at the landing spot. */
const HEAP_YAW = Math.atan2(-(LAND.z - HEAP_AT[2]), LAND.x - HEAP_AT[0]);

/** Scroll at which the canopy is packed away again on the ground. */
const LANDED_AT = 0.985;
const FLAG_COLORS = [palette.canopyYellow, palette.canopyTeal, palette.canopyRed] as const;

/** Waypoints: little cloud puffs with a flag, alternating screen-left/right of the path. */
const WAYPOINTS = experience.map((_, i) => {
  const at = avatarAt(spreadInZone("deployment", experience.length, i, 0.05));
  const side = i % 2 === 0 ? 1 : -1;
  return [at.x - side * 2.6, at.y + 0.6, at.z + side * 2.6] as [number, number, number];
});

function Waypoint({ color }: { color: string }) {
  return (
    <group>
      {[
        [0, 0, 0, 0.55],
        [-0.45, -0.05, 0.1, 0.4],
        [0.45, -0.05, -0.1, 0.42],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} scale={[s, s * 0.75, s]}>
          <sphereGeometry args={[1, 14, 10]} />
          <Matte color={palette.cloud} />
        </mesh>
      ))}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <Matte color={palette.woodDark} />
      </mesh>
      <mesh position={[0.22, 1.22, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.42, 0.28, 0.03]} />
        <Matte color={color} />
      </mesh>
    </group>
  );
}

/**
 * The canopy pops open at the start of the zone (springy scale) and stays overhead
 * until landing. Experience entries are flagged waypoints along the canopy flight.
 */
export function DeploymentZone() {
  const zone = getZone("deployment");
  const canopyRef = useRef<Group>(null);
  const avatar = useRef(new Vector3()).current;
  const scale = useRef({ x: 0.01, y: 0.01 }).current;
  const reserveRef = useRef<Group>(null);
  const reserveScale = useRef({ x: 0.01, y: 0.01 }).current;
  const cut = useRef({ k: 0 }).current;
  const reservePos = useRef(new Vector3()).current;
  const reserveUsed = useAppStore((s) => s.reserve);
  const heapRef = useRef<Group>(null);
  const heap = useRef({ s: 0 }).current;
  const { ref: waypointsRef } = useZoneWindow(zone.start - 0.06, zone.end + 0.04);
  const activeZone = useAppStore((s) => s.activeZone);
  const openPanel = useAppStore((s) => s.openPanel);

  useFrame((state, delta) => {
    const g = canopyRef.current;
    if (!g) return;
    const t = scrollState.current;
    const open = t >= zone.start && t < LANDED_AT;
    // Hide only once fully collapsed so both the "pop" and the deflate read.
    g.visible = open || scale.y > 0.02;
    if (!g.visible) return;

    getAvatarPosition(t, avatar);
    g.position.copy(avatar);

    const reserveOut = useAppStore.getState().reserve;
    // Cutaway: the released main tumbles straight at the viewer and "hits" the screen
    // (it's gone just before reaching the camera). Reduced motion: it simply vanishes.
    cut.k = reserveOut ? Math.min(1, cut.k + delta / 1.3) : 0;
    const flying = reserveOut && !scrollState.reducedMotion && cut.k < 0.97;
    if (reserveOut && cut.k > 0) {
      const k = cut.k * cut.k; // accelerates toward the lens
      const cam = state.camera.position;
      g.position.set(
        avatar.x + (cam.x - avatar.x) * k,
        avatar.y + 1.2 * Math.sin(cut.k * Math.PI) + (cam.y - avatar.y) * k,
        avatar.z + (cam.z - avatar.z) * k,
      );
      g.rotation.set(Math.sin(cut.k * 9) * 0.5, Math.PI / 4 + cut.k * 2.5, cut.k * 3.2);
    } else {
      g.rotation.set(0, Math.PI / 4, 0);
    }
    if (flying) {
      g.scale.setScalar(1);
      scale.x = scale.y = 1;
      return;
    }
    const target = open && !reserveOut ? 1 : 0.01;
    if (reserveOut) scale.x = scale.y = 0.01;
    if (scrollState.reducedMotion) {
      scale.x = scale.y = target;
    } else {
      // Width snaps open slightly ahead of height: reads as the canopy "inflating".
      easing.damp(scale, "x", target, 0.1, delta);
      easing.damp(scale, "y", target, 0.2, delta);
    }
    g.scale.set(scale.x, scale.y, scale.x);
  });

  // Easter egg: the reserve (orange/white) snaps open overhead after a cutaway. Its own frame
  // loop, so it keeps deflating (and hides) even once the main canopy is out of the picture.
  useFrame((_, delta) => {
    const r = reserveRef.current;
    if (!r) return;
    const t = scrollState.current;
    const open = t >= zone.start && t < LANDED_AT;
    const rt = open && useAppStore.getState().reserve ? 1 : 0.01;
    if (scrollState.reducedMotion) reserveScale.x = reserveScale.y = rt;
    else {
      easing.damp(reserveScale, "x", rt, 0.08, delta);
      easing.damp(reserveScale, "y", rt, 0.16, delta);
    }
    r.visible = reserveScale.y > 0.02;
    if (!r.visible) return;
    getAvatarPosition(t, reservePos);
    r.position.copy(reservePos);
    r.scale.set(reserveScale.x * 0.85, reserveScale.y * 0.85, reserveScale.x * 0.85);
  });

  // After landing the canopy lies on the grass behind me (it settles as the wing deflates).
  useFrame((_, delta) => {
    const h = heapRef.current;
    if (!h) return;
    const landed = scrollState.current >= LANDED_AT;
    const target = landed ? 1 : 0;
    if (scrollState.reducedMotion) heap.s = target;
    else easing.damp(heap, "s", target, landed ? 0.35 : 0.12, delta);
    h.visible = heap.s > 0.02;
    // Drop in from a little above while spreading out flat.
    h.position.set(HEAP_AT[0], 0.02 + (1 - heap.s) * 0.9, HEAP_AT[2]);
    const k = heap.s * HEAP_SCALE;
    h.scale.set(k, Math.max(0.01, k), k);
  });

  return (
    <>
      {/* yaw so the wing spans across the screen in the iso view */}
      <group ref={canopyRef} visible={false} rotation={[0, Math.PI / 4, 0]}>
        <Canopy />
      </group>
      {/* easter egg: the reserve (orange/white) */}
      <group ref={reserveRef} visible={false} rotation={[0, Math.PI / 4, 0]}>
        <Canopy colors={RESERVE_COLORS} />
      </group>
      {/* landed: the canopy lies flat on the ground, lines trailing toward me */}
      <group ref={heapRef} visible={false} rotation={[0, HEAP_YAW, 0]}>
        {/* after a cutaway the reserve is what ends up on the grass */}
        <GroundCanopy colors={reserveUsed ? RESERVE_COLORS : undefined} />
      </group>
      <group ref={waypointsRef}>
        {experience.map((e, i) => (
          <group key={`${e.company}-${e.start}`} position={WAYPOINTS[i]}>
            <Waypoint color={FLAG_COLORS[i % FLAG_COLORS.length]} />
            <WorldHtml position={[0, 1.45, 0]} visible={activeZone === "deployment"}>
              <WorldSign
                tone="teal"
                label={e.company}
                sub={`${e.start} – ${e.end}`}
                actionLabel={`${e.role} at ${e.company}: show details`}
                onClick={() => openPanel({ kind: "experience", index: i })}
              />
            </WorldHtml>
          </group>
        ))}
      </group>
    </>
  );
}
