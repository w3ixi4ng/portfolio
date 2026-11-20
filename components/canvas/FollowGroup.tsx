"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode, type RefObject } from "react";
import type { Group } from "three";

/** A group that copies another group's position each frame (so labels don't rotate with it). */
export function FollowGroup({
  target,
  children,
}: {
  target: RefObject<Group | null>;
  children: ReactNode;
}) {
  const g = useRef<Group>(null);
  useFrame(() => {
    if (g.current && target.current) g.current.position.copy(target.current.position);
  });
  return <group ref={g}>{children}</group>;
}
