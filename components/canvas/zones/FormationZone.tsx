"use client";

import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3, type Group } from "three";
import { skills } from "@/content";
import { EggButton } from "@/components/ui/world/EggButton";
import { EGG_COPY } from "@/components/ui/world/eggCopy";
import { SpeechBubble } from "@/components/ui/world/SpeechBubble";
import { WorldSign } from "@/components/ui/world/WorldSign";
import { getZone, lerp, zoneProgress } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";
import { palette, suitColors } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import type { RigStyle } from "../characters/Rig";
import type { CharacterId } from "../characters/roster";
import { WorldHtml } from "../WorldHtml";
import { getAvatarPosition } from "../path";
import { useEgg } from "../useEgg";
import { useZoneWindow } from "./useZoneWindow";

/** Faces for the formation (never the avatar's Rogue), and a different bag for each. */
const FACES: readonly CharacterId[] = ["knight", "mage", "barbarian", "ranger"];
const RIGS: readonly RigStyle[] = ["wide", "round", "pack", "wide"];
const RIG_COLORS = [palette.signNavy, palette.canopyTeal, palette.terracotta, palette.ink] as const;
const HELMETS = [
  palette.canopyYellow,
  palette.signNavy,
  palette.canopyTeal,
  palette.terracotta,
] as const;

const FLIP_SECONDS = 0.9;

/**
 * One jumper per skill group flies in and links into a ring around the avatar (other planes,
 * other jumpers: I'm the only one who leaves mine). Each carries a signboard naming its group.
 * Easter egg #1: click a jumper → a little backflip and a thumbs-up.
 */
export function FormationZone() {
  const zone = getZone("formation");
  const { ref, active } = useZoneWindow(zone.start - 0.03, zone.end + 0.03);
  const avatar = useRef(new Vector3()).current;
  const members = useRef<(Group | null)[]>([]);
  const spinners = useRef<(Group | null)[]>([]);
  const bodies = useRef<(Group | null)[]>([]);
  const flipAt = useRef<number[]>([]);
  const pending = useRef<boolean[]>([]);
  const activeZone = useAppStore((s) => s.activeZone);
  const openPanel = useAppStore((s) => s.openPanel);
  const [cheering, setCheering] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const egg = useEgg();
  useCursor(hover);
  const count = skills.length;

  useEffect(() => {
    if (cheering === null) return;
    const t = window.setTimeout(() => setCheering(null), 1800);
    return () => window.clearTimeout(t);
  }, [cheering]);

  useFrame((state) => {
    if (!active.current) return;
    const t = scrollState.current;
    getAvatarPosition(t, avatar);
    const k = zoneProgress(t, zone);
    const time = state.clock.elapsedTime;
    // Fly in from wide, settle into a ring by ~55% through the zone, then hold. The ring stays
    // wide enough (arms span ~2 units each) that nobody overlaps me.
    const radius = lerp(9, 4.6, Math.min(1, k / 0.55));
    const spin = scrollState.reducedMotion ? 0 : time * 0.04;
    members.current.forEach((g, i) => {
      if (!g) return;
      const a = (i / count) * Math.PI * 2 + spin;
      g.position.set(
        avatar.x + Math.cos(a) * radius,
        avatar.y + 0.6,
        avatar.z + Math.sin(a) * radius,
      );
      // Belly-to-earth (head → +z), then yaw so the head points at the ring centre.
      bodies.current[i]?.rotation.set(
        Math.PI / 2,
        Math.atan2(-Math.cos(a), -Math.sin(a)),
        0,
        "YXZ",
      );
      // Backflip (easter egg #1).
      if (pending.current[i]) {
        pending.current[i] = false;
        flipAt.current[i] = time;
      }
      const f = Math.min(1, (time - (flipAt.current[i] ?? -10)) / FLIP_SECONDS);
      const s = spinners.current[i];
      if (s) s.rotation.x = f < 1 ? -Math.PI * 2 * (1 - (1 - f) ** 3) : 0;
    });
  }, -4);

  const flip = (i: number) => {
    pending.current[i] = true;
    setCheering(i);
    egg("buddy-flip");
  };

  return (
    <group ref={ref}>
      {skills.map((group, i) => (
        <group
          key={group.group}
          ref={(g) => {
            members.current[i] = g;
          }}
        >
          <group
            ref={(g) => {
              spinners.current[i] = g;
            }}
            onClick={(e) => {
              e.stopPropagation();
              flip(i);
            }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
          >
            <group
              ref={(g) => {
                bodies.current[i] = g;
              }}
            >
              <Jumper
                character={FACES[i % FACES.length]}
                suitColor={suitColors[i % suitColors.length]}
                trimColor={i % 2 ? palette.cream : palette.paper}
                gloveColor={suitColors[(i + 3) % suitColors.length]}
                bootColor={i % 2 ? palette.ink : palette.terracottaDeep}
                helmetColor={HELMETS[i % HELMETS.length]}
                rigStyle={RIGS[i % RIGS.length]}
                rigColor={RIG_COLORS[i % RIG_COLORS.length]}
                rigTrim={i % 2 ? palette.canopyYellow : palette.paper}
                pose="freefall"
                phase={i}
              />
            </group>
          </group>
          <WorldHtml
            position={[0, 0.9, -0.5]}
            visible={activeZone === "formation" && cheering !== i}
          >
            <WorldSign
              tone="navy"
              label={group.group}
              sub={`${group.items.length} skills`}
              actionLabel={`${group.group}: show ${group.items.length} skills`}
              onClick={() => openPanel({ kind: "skills", index: i })}
            />
          </WorldHtml>
          <WorldHtml position={[0, 0.9, -0.5]} visible={cheering === i}>
            <SpeechBubble>
              <p className="font-bold">{EGG_COPY.buddy}</p>
            </SpeechBubble>
          </WorldHtml>
          <WorldHtml position={[0, 0.3, 0]} visible={activeZone === "formation" && cheering !== i}>
            <EggButton label={`High-five the ${group.group} jumper`} onClick={() => flip(i)} />
          </WorldHtml>
        </group>
      ))}
    </group>
  );
}
