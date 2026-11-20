"use client";

import { useCursor } from "@react-three/drei";
import { useState } from "react";
import { WorldSign } from "@/components/ui/world/WorldSign";
import { useAppStore } from "@/lib/store";
import { WorldHtml } from "../WorldHtml";
import { facing, type HangarSpec } from "../hangarLayout";
import { requestWalk } from "../requestWalk";
import { Hangar } from "./Hangar";
import { Kit, preloadKit, type KitName } from "./Kit";

/** What each hangar "contains", displayed in the doorway (themed CC0 props). */
const CONTENTS: Record<
  HangarSpec["section"],
  { name: KitName; at: [number, number]; rot?: number; scale: number }[]
> = {
  projects: [
    { name: "restaurant/crate_tomatoes", at: [-2.3, 3.4], rot: 0.3, scale: 0.28 },
    { name: "restaurant/crate_cheese", at: [2.2, 3.5], rot: -0.4, scale: 0.28 },
    { name: "restaurant/menu", at: [2.1, 4.4], rot: -0.7, scale: 0.7 },
  ],
  experience: [
    { name: "furniture/shelf_B_small_decorated", at: [-2.4, 3.4], rot: 0.2, scale: 0.6 },
    { name: "furniture/pictureframe_standing_A", at: [2.2, 3.5], rot: -0.3, scale: 0.7 },
    { name: "furniture/chair_stool", at: [2.3, 4.4], rot: 0.5, scale: 0.4 },
  ],
  skills: [
    { name: "resource/Parts_Cog", at: [-2.3, 3.5], rot: 0.4, scale: 1.4 },
    { name: "resource/Parts_Pile_Medium", at: [2.3, 3.5], rot: -0.2, scale: 0.4 },
    { name: "resource/Fuel_A_Barrel", at: [-2.4, 4.5], scale: 0.4 },
  ],
};
preloadKit(Object.values(CONTENTS).flatMap((c) => c.map((p) => p.name)));

/**
 * One of the three hangars round the plaza. Click it (or its sign) and I walk in; the panel
 * with that hangar's projects / experience / skills opens when I arrive.
 */
export function HangarHub({ spec }: { spec: HangarSpec }) {
  const atDropzone = useAppStore((s) => s.activeZone === "dropzone");
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const go = () => requestWalk(spec.section);

  return (
    <>
      <group
        position={[spec.x, 0, spec.z]}
        rotation={[0, facing(spec), 0]}
        onClick={(e) => {
          e.stopPropagation();
          go();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <Hangar position={[0, 0, 0]} trim={spec.trim} />
        {CONTENTS[spec.section].map((p, i) => (
          <Kit
            key={i}
            name={p.name}
            position={[p.at[0], 0, p.at[1]]}
            rotation={[0, p.rot ?? 0, 0]}
            scale={p.scale}
          />
        ))}
      </group>
      <WorldHtml position={[spec.x, 2.9, spec.z]} visible={atDropzone}>
        <WorldSign
          label={spec.label}
          sub={spec.sub}
          tone={spec.tone}
          actionLabel={`${spec.sub}: walk into ${spec.label}`}
          onClick={go}
        />
      </WorldHtml>
    </>
  );
}
