"use client";

import { useFrame } from "@react-three/fiber";
import { getZone } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { EXIT, PLANE_FLOOR_Y } from "../path";
import { Plane } from "../props/Plane";
import { useZoneWindow } from "./useZoneWindow";

const smoothstep = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** The plane diorama. Ramp opens as you approach the exit, then the plane flies off. */
export function PlaneZone() {
  const plane = getZone("plane");
  const { ref, active } = useZoneWindow(0, plane.end + 0.12);

  useFrame((state) => {
    if (!active.current || !ref.current) return;
    const t = scrollState.current;
    const away = smoothstep(plane.end - 0.03, plane.end + 0.12, t);
    const hover = scrollState.reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
    ref.current.position.set(-away * 30, PLANE_FLOOR_Y + away * 4 + hover, -away * 6);
  });

  return (
    <group ref={ref} position={[0, PLANE_FLOOR_Y, 0]}>
      <Plane rampOpen={() => smoothstep(EXIT.rampFrom, EXIT.rampTo, scrollState.current)} />
    </group>
  );
}
