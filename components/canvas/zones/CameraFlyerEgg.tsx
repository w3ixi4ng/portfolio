"use client";

import { RoundedBox, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Vector3, type Group } from "three";
import { funFacts, isTodo } from "@/content";
import { EggButton } from "@/components/ui/world/EggButton";
import { EGG_COPY } from "@/components/ui/world/eggCopy";
import { SpeechBubble } from "@/components/ui/world/SpeechBubble";
import { getZone } from "@/lib/scroll";
import { scrollState } from "@/lib/scrollState";
import { sfx } from "@/lib/sound";
import { palette } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { FollowGroup } from "../FollowGroup";
import { Matte } from "../Matte";
import { WorldHtml } from "../WorldHtml";
import { getAvatarPosition } from "../path";
import { useBlip } from "../useBlip";
import { useEgg } from "../useEgg";
import { useZoneWindow } from "./useZoneWindow";

const FACTS = funFacts.filter((f) => !isTodo(f));
const FLYER_FROM = getZone("formation").start + 0.05;
const FLYER_TO = FLYER_FROM + 0.09;

/**
 * Easter egg #3: a camera-flyer with a helmet cam zips past once, high on the screen.
 * Click → "selfie" (shutter + a fun fact from content/portfolio.json).
 */
export function CameraFlyerEgg() {
  const egg = useEgg();
  const flyer = useRef<Group>(null);
  const avatar = useRef(new Vector3()).current;
  const [hover, setHover] = useState(false);
  const [snapped, snap] = useBlip(4000);
  const [factIndex, setFactIndex] = useState(0);
  useCursor(hover);
  const { ref, active } = useZoneWindow(FLYER_FROM, FLYER_TO);

  useFrame(() => {
    const g = flyer.current;
    if (!active.current || !g) return;
    getAvatarPosition(scrollState.current, avatar);
    // One quick fly-by along the far side (never over me), not a constant orbit.
    const k = (scrollState.current - FLYER_FROM) / (FLYER_TO - FLYER_FROM);
    g.position.set(avatar.x - 9 + k * 18, avatar.y + 1.1, avatar.z - 5.2);
    g.rotation.set(Math.PI / 2, Math.PI / 2, 0, "YXZ"); // belly-down, heading right
  });

  const take = () => {
    sfx.shutter();
    setFactIndex((i) => (FACTS.length ? (i + 1) % FACTS.length : 0));
    snap();
    egg("selfie");
  };

  const text = FACTS.length ? `📸 Fun fact: ${FACTS[factIndex]}` : EGG_COPY.selfieNoFacts;

  return (
    <group ref={ref}>
      <group ref={flyer}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            take();
          }}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <Jumper
            character="mage"
            suitColor={palette.signNavy}
            trimColor={palette.canopyYellow}
            gloveColor={palette.ink}
            helmetColor={palette.ink}
            rigStyle="wide"
            rigColor={palette.signNavy}
            rigTrim={palette.canopyYellow}
            pose="freefall"
            phase={4}
          >
            {/* helmet cam */}
            <RoundedBox args={[0.2, 0.16, 0.26]} position={[0, 1.42, 0.05]} radius={0.03}>
              <Matte color={palette.ink} />
            </RoundedBox>
            <mesh position={[0, 1.42, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 12]} />
              <meshStandardMaterial color={palette.skyTop} roughness={0.1} />
            </mesh>
          </Jumper>
        </group>
      </group>
      {/* bubble + keyboard button ride along with the flyer */}
      <FollowGroup target={flyer}>
        <WorldHtml position={[0, 0.9, -0.8]} visible={snapped}>
          <SpeechBubble>
            <p>{text}</p>
          </SpeechBubble>
        </WorldHtml>
        <WorldHtml position={[0, 0.2, 0]} visible={!snapped}>
          <EggButton label="Snap a selfie with the camera-flyer" onClick={take} />
        </WorldHtml>
      </FollowGroup>
    </group>
  );
}
