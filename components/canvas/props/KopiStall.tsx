"use client";

import { RoundedBox, useCursor } from "@react-three/drei";
import { useState } from "react";
import { EggButton } from "@/components/ui/world/EggButton";
import { WorldSign } from "@/components/ui/world/WorldSign";
import { useAppStore } from "@/lib/store";
import { palette } from "@/lib/theme";
import { Matte } from "../Matte";
import { WorldHtml } from "../WorldHtml";
import { requestWalk } from "../requestWalk";
import { Kit, preloadKit } from "./Kit";

preloadKit([
  "kenney/steamer",
  "kenney/cup-coffee",
  "kenney/cup-tea",
  "restaurant/table_round_A_small",
  "restaurant/chair_stool",
]);

const STRIPES = 8;
const WIDTH = 2.2;

/**
 * A little kopi stall (settings.singaporeTouch): counter with a steamer and cups, a back wall,
 * a striped awning held up by four posts, a hanging sign, and a table with stools in front.
 * Local +z is the customer side; origin = ground, centre of the counter.
 */
export function KopiStall() {
  const atDropzone = useAppStore((s) => s.activeZone === "dropzone");
  const [hover, setHover] = useState(false);
  useCursor(hover);
  const go = () => requestWalk("kopi");
  return (
    <group
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
      {/* back wall (teal) with a shelf */}
      <RoundedBox
        args={[WIDTH, 2.25, 0.12]}
        position={[0, 1.125, -0.5]}
        radius={0.04}
        castShadow
        receiveShadow
      >
        <Matte color={palette.canopyTeal} />
      </RoundedBox>
      <mesh position={[0, 1.45, -0.4]} castShadow>
        <boxGeometry args={[WIDTH * 0.8, 0.07, 0.28]} />
        <Matte color={palette.earth} />
      </mesh>
      {/* counter */}
      <RoundedBox
        args={[WIDTH, 0.88, 0.8]}
        position={[0, 0.44, 0]}
        radius={0.05}
        castShadow
        receiveShadow
      >
        <Matte color={palette.cream} />
      </RoundedBox>
      <RoundedBox
        args={[WIDTH + 0.1, 0.08, 0.92]}
        position={[0, 0.92, 0.02]}
        radius={0.03}
        castShadow
      >
        <Matte color={palette.terracottaDeep} />
      </RoundedBox>
      {/* things on the counter (sitting on its top, y = 0.96) */}
      <Kit name="kenney/steamer" position={[-0.55, 0.96, -0.05]} scale={0.55} />
      <Kit
        name="kenney/cup-coffee"
        position={[0.1, 0.96, 0.15]}
        rotation={[0, 0.4, 0]}
        scale={0.7}
      />
      <Kit name="kenney/cup-tea" position={[0.4, 0.96, 0.05]} rotation={[0, -0.3, 0]} scale={0.7} />
      <Kit
        name="kenney/cup-coffee"
        position={[0.7, 0.96, 0.2]}
        rotation={[0, 0.9, 0]}
        scale={0.7}
      />
      {/* a row of cups on the shelf */}
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <Kit key={x} name="kenney/cup-tea" position={[x, 1.49, -0.4]} scale={0.55} />
      ))}

      {/* awning: four posts + red/cream stripes, sloping forward */}
      {[-1, 1].flatMap((sx) =>
        [
          { z: -0.5, h: 2.25 },
          { z: 0.75, h: 1.97 },
        ].map((p) => (
          <mesh key={`${sx}-${p.z}`} position={[sx * (WIDTH / 2 - 0.04), p.h / 2, p.z]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, p.h, 8]} />
            <Matte color={palette.ink} />
          </mesh>
        )),
      )}
      <group position={[0, 2.12, 0.14]} rotation={[0.2, 0, 0]}>
        {Array.from({ length: STRIPES }, (_, i) => (
          <mesh
            key={i}
            position={[-WIDTH / 2 - 0.1 + ((i + 0.5) * (WIDTH + 0.2)) / STRIPES, 0, 0]}
            castShadow
          >
            <boxGeometry args={[(WIDTH + 0.2) / STRIPES, 0.05, 1.4]} />
            <Matte color={i % 2 === 0 ? palette.canopyRed : palette.paper} />
          </mesh>
        ))}
      </group>

      {/* sign on a pole above the awning */}
      <WorldHtml position={[0, 2.35, 0.3]} visible={atDropzone}>
        <WorldSign
          label="Kopi"
          tone="cream"
          actionLabel="Walk over to the kopi stall for a drink"
          onClick={go}
        />
      </WorldHtml>

      <WorldHtml position={[0, 0.4, 1.2]} visible={atDropzone}>
        <EggButton label="Walk to the kopi stall for a drink" onClick={go} />
      </WorldHtml>

      {/* a table and stools in front */}
      <Kit name="restaurant/table_round_A_small" position={[0.4, 0, 2.3]} scale={0.45} />
      <Kit name="restaurant/chair_stool" position={[1.25, 0, 2.4]} scale={0.45} />
      <Kit name="restaurant/chair_stool" position={[-0.4, 0, 3.0]} scale={0.45} />
    </group>
  );
}
