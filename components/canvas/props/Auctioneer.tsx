"use client";

import { RoundedBox } from "@react-three/drei";
import { palette, suitColors } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { Matte } from "../Matte";

/** Bidly island: an auctioneer behind a podium at the podium. */
export function Auctioneer({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.6, 0.45, 0.45]} position={[0, 0.22, 0.35]} radius={0.05} castShadow>
        <Matte color={palette.terracottaDeep} />
      </RoundedBox>
      <Jumper
        character="ranger"
        suitColor={suitColors[4]}
        trimColor={palette.paper}
        gloveColor={palette.ink}
        helmetColor={palette.canopyTeal}
        rigStyle="round"
        rigColor={palette.signNavy}
        rigTrim={palette.canopyYellow}
        pose="stand"
        scale={0.7}
        phase={0.8}
      />
    </group>
  );
}
