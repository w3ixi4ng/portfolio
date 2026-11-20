"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { scrollState } from "@/lib/scrollState";
import {
  PORTRAIT_DISTANCE,
  getAvatarPosition,
  getFocusOffset,
  getFov,
  getOrbit,
  orbitDirection,
} from "./path";

/**
 * Scroll → camera (CLAUDE.md §4): 3/4 diorama view in the plane, swings overhead into the
 * top-down freefall view, eases back out to a 3/4 chase at deployment and a diorama view
 * for landing. Low-FOV perspective throughout (design/STYLE.md §5).
 */
export function CameraRig() {
  const focus = useRef(new Vector3()).current;
  const offset = useRef(new Vector3()).current;
  const orbit = useRef(new Vector3()).current;
  const dir = useRef(new Vector3()).current;

  // Priority < 0: runs before drei <Html> labels read the camera, so they never lag a frame.
  useFrame((state) => {
    const { camera, size } = state;
    const t = scrollState.current;
    const portrait = size.width < size.height;

    getAvatarPosition(t, focus);
    getFocusOffset(t, offset);
    getOrbit(t, orbit);
    if (portrait) {
      offset.x = 0;
      offset.z = 0;
    }
    focus.add(offset);

    let pitch = orbit.x;
    let yaw = orbit.y;
    if (!scrollState.reducedMotion) {
      // Slow drift: a degree or two, so it feels alive but never spins.
      const time = state.clock.elapsedTime;
      pitch += Math.sin(time * 0.31) * 0.8;
      yaw += Math.sin(time * 0.23) * 1.5;
    }
    const distance = orbit.z * (portrait ? PORTRAIT_DISTANCE : 1);
    orbitDirection(pitch, yaw, dir);
    camera.position.copy(focus).addScaledVector(dir, distance);

    // No extra smoothing here: scrollState.current is already eased, and a second lag
    // would let the avatar drift off-centre during fast scrolls.
    camera.lookAt(focus);

    const fov = getFov(t);
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, -5);

  return null;
}
