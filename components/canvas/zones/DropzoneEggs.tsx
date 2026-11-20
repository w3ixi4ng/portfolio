"use client";

import { useCursor } from "@react-three/drei";
import { useEffect, useState } from "react";
import { EggButton } from "@/components/ui/world/EggButton";
import { EGG_COPY } from "@/components/ui/world/eggCopy";
import { SpeechBubble } from "@/components/ui/world/SpeechBubble";
import { useAppStore } from "@/lib/store";
import { palette, suitColors } from "@/lib/theme";
import { Jumper } from "../characters/Jumper";
import { Windsock } from "../props/Windsock";
import { useEgg } from "../useEgg";
import { WorldHtml } from "../WorldHtml";

const PACKER_AT: [number, number, number] = [3.8, 0.1, 3.4];

/**
 * Dropzone easter eggs (CLAUDE.md §5): #4 poke the windsock → it spins and flaps wildly;
 * #5 poke the sleeping packer → "I'M UP!".
 */
export function DropzoneEggs() {
  const egg = useEgg();
  const atDropzone = useAppStore((s) => s.activeZone === "dropzone");
  const [packerAwake, setPackerAwake] = useState(false);
  const [hoverPacker, setHoverPacker] = useState(false);
  useCursor(hoverPacker);

  useEffect(() => {
    if (!packerAwake) return;
    const t = window.setTimeout(() => setPackerAwake(false), 2600);
    return () => window.clearTimeout(t);
  }, [packerAwake]);

  const wakePacker = () => {
    setPackerAwake(true);
    egg("packer");
  };

  return (
    <>
      <Windsock position={[7.6, 0, 4.4]} onPoke={() => egg("windsock")} />
      <WorldHtml position={[7.6, 0.2, 4.4]} visible={atDropzone}>
        <EggButton label="Poke the windsock" onClick={() => egg("windsock")} />
      </WorldHtml>

      <group
        position={PACKER_AT}
        rotation={[0, -Math.PI / 4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          wakePacker();
        }}
        onPointerOver={() => setHoverPacker(true)}
        onPointerOut={() => setHoverPacker(false)}
      >
        <Jumper
          character="barbarian"
          suitColor={suitColors[3]}
          trimColor={palette.cream}
          gloveColor={palette.canopyYellow}
          helmetColor={palette.terracotta}
          rigStyle="pack"
          rigColor={palette.canopyTeal}
          rigTrim={palette.paper}
          pose={packerAwake ? "wave" : "sleep"}
          // The sleeping pose's origin is at his feet and he lies toward −z: shift him onto the
          // middle of the mat and lift him clear of the rug (he used to sink into it).
          position={packerAwake ? [-0.1, 0, 0] : [-0.1, 0.07, 0.95]}
          phase={1.3}
        />
      </group>
      <WorldHtml position={[PACKER_AT[0], 1.6, PACKER_AT[2]]} visible={packerAwake}>
        <SpeechBubble>
          <p className="font-bold">{EGG_COPY.packer}</p>
        </SpeechBubble>
      </WorldHtml>
      <WorldHtml position={[PACKER_AT[0], 0.3, PACKER_AT[2]]} visible={atDropzone && !packerAwake}>
        <EggButton label="Poke the sleepy packer" onClick={wakePacker} />
      </WorldHtml>
    </>
  );
}
