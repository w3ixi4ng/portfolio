"use client";

import { RoundedBox } from "@react-three/drei";
import type { IslandTheme } from "@/content";
import { islandColors, palette } from "@/lib/theme";
import { Auctioneer } from "./Auctioneer";
import { DioramaBase } from "./DioramaBase";
import { FlipCalendar } from "./FlipCalendar";
import { Kit, preloadKit } from "./Kit";
import { MarketStall } from "./MarketStall";
import { MonitorTower } from "./MonitorTower";
import { PrintingPress } from "./PrintingPress";
import { RainCloud } from "./RainCloud";
import { Matte } from "../Matte";

const F = 0.38; // furniture/restaurant/resource → island scale
const T = 1.7; // Kenney trees → island scale

/**
 * Theme-specific dressing for a project island (CLAUDE.md §14 island ideas). Data-driven by
 * `islandTheme`, so new projects pick up a look automatically.
 */
export function IslandDecor({ theme, accent }: { theme: IslandTheme; accent: string }) {
  switch (theme) {
    case "city":
      // Bidly: a bustling market with an auctioneer banging a gavel.
      return (
        <>
          <MarketStall position={[-0.8, 0, -0.5]} color={palette.canopyRed} rotation={0.3} />
          <MarketStall position={[0.6, 0, -0.9]} color={palette.canopyTeal} rotation={-0.2} />
          <Kit
            name="restaurant/crate_tomatoes"
            position={[-1.2, 0, 0.5]}
            rotation={[0, 0.4, 0]}
            scale={F * 0.6}
          />
          <Kit
            name="restaurant/crate_carrots"
            position={[-0.6, 0, 0.9]}
            rotation={[0, -0.3, 0]}
            scale={F * 0.6}
          />
          <Kit
            name="restaurant/crate_cheese"
            position={[1.2, 0, 0.2]}
            rotation={[0, 0.2, 0]}
            scale={F * 0.6}
          />
          <Kit
            name="restaurant/menu"
            position={[0.9, 0, 0.9]}
            rotation={[0, -0.6, 0]}
            scale={0.7}
          />
          <Kit name="city/streetlight" position={[-1.4, 0, -1.0]} scale={1.6} />
          <Auctioneer position={[0.2, 0, 0.3]} />
        </>
      );
    case "snow": {
      // Platform Migration: two islands joined by a bridge; one cloud rains, the
      // monitoring tower on the other keeps blinking happily.
      const c = islandColors.snow;
      return (
        <>
          <Kit name="nature/tree_pineRoundA" position={[-0.9, 0, -0.6]} scale={T} />
          <Kit name="nature/tree_pineRoundC" position={[-1.3, 0, 0.5]} scale={T * 0.8} />
          <Kit
            name="nature/rock_largeA"
            position={[0.5, 0, 0.9]}
            rotation={[0, 0.5, 0]}
            scale={1.2}
          />
          <RainCloud position={[-0.6, 2.4, 0]} />
          <Kit
            name="kenney/bridge_woodNarrow"
            position={[2.35, -0.1, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[1.2, 1, 1.6]}
          />
          <group position={[3.9, -0.15, 0]}>
            <DioramaBase radius={1.3} top={c.top} soil={c.side} depth={0.8} />
            <MonitorTower position={[0, 0, 0]} />
            <Kit name="nature/tree_pineTallA" position={[0.7, 0, 0.5]} scale={T * 0.8} />
          </group>
        </>
      );
    }
    case "beach":
      // Booking System: a tiny office with a calendar flipping pages quickly.
      return (
        <>
          <Kit name="furniture/rug_rectangle_stripes_A" position={[0, 0, 0]} scale={0.5} />
          <Kit name="furniture/table_medium" position={[0, 0, -0.2]} scale={F} />
          <Kit
            name="furniture/chair_A"
            position={[0, 0, 0.45]}
            rotation={[0, Math.PI, 0]}
            scale={F}
          />
          <Kit
            name="furniture/shelf_B_small_decorated"
            position={[-1.1, 0, -0.9]}
            rotation={[0, 0.5, 0]}
            scale={0.6}
          />
          <Kit name="furniture/lamp_table" position={[0.25, 0.38, -0.35]} scale={0.22} />
          <FlipCalendar position={[-0.25, 0.38, -0.3]} />
          <Kit name="kenney/tree_palmShort" position={[1.2, 0, -0.7]} scale={T} />
          <Kit name="kenney/tree_palmBend" position={[-1.3, 0, 0.7]} scale={T} />
        </>
      );
    case "desert":
      // Content Pipeline: a little printing press shooting out newspapers.
      return (
        <>
          <PrintingPress position={[-0.6, 0, -0.3]} />
          <Kit name="resource/Textiles_Stack_Large" position={[0.9, 0, -0.8]} scale={F * 0.7} />
          <Kit
            name="furniture/book_set"
            position={[0.8, 0.12, 0.6]}
            rotation={[0, 0.4, 0]}
            scale={0.6}
          />
          <Kit
            name="resource/Parts_Cog"
            position={[-1.3, 0.15, 0.6]}
            rotation={[0, 0.3, 0]}
            scale={1.3}
          />
          <Kit name="furniture/cactus_medium_A" position={[1.3, 0, 0.3]} scale={0.55} />
          <Kit name="furniture/cactus_small_B" position={[-0.2, 0, 1.2]} scale={0.6} />
        </>
      );
    case "forest":
    default:
      return (
        <>
          <Kit name="nature/tree_oak" position={[-0.9, 0, -0.4]} scale={T} />
          <Kit name="nature/tree_default" position={[0.8, 0, -0.8]} scale={T} />
          <Kit name="nature/mushroom_redGroup" position={[0.3, 0, 0.8]} scale={1.6} />
          <Kit name="nature/log_stack" position={[-0.6, 0, 0.9]} scale={1.3} />
          <Kit name="city/bench" position={[0.9, 0, 0.5]} rotation={[0, -0.6, 0]} scale={2} />
          {/* a little cabin in the island's accent colour */}
          <group position={[0.1, 0, -0.1]}>
            <RoundedBox args={[0.7, 0.55, 0.6]} position={[0, 0.28, 0]} radius={0.05} castShadow>
              <Matte color={palette.cream} />
            </RoundedBox>
            <mesh position={[0, 0.72, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[0.58, 0.38, 4]} />
              <Matte color={accent} />
            </mesh>
          </group>
        </>
      );
  }
}

preloadKit([
  "restaurant/crate_tomatoes",
  "restaurant/crate_carrots",
  "restaurant/crate_cheese",
  "restaurant/menu",
  "city/streetlight",
  "city/watertower",
  "nature/tree_pineRoundA",
  "nature/tree_pineRoundC",
  "nature/tree_pineTallA",
  "nature/rock_largeA",
  "kenney/bridge_woodNarrow",
  "furniture/rug_rectangle_stripes_A",
  "furniture/table_medium",
  "furniture/chair_A",
  "furniture/shelf_B_small_decorated",
  "furniture/lamp_table",
  "kenney/tree_palmShort",
  "kenney/tree_palmBend",
  "resource/Textiles_Stack_Large",
  "furniture/book_set",
  "resource/Parts_Cog",
  "furniture/cactus_medium_A",
  "furniture/cactus_small_B",
]);
