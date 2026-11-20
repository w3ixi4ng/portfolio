"use client";

import { EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import { useAppStore } from "@/lib/store";

/**
 * Post FX (design/STYLE.md section 3): ambient occlusion in corners (the "rendered toy"
 * look) and a soft vignette. No bloom: its blur pyramid flashed the screen black on some GPUs. No blur, tilt-shift or DOF (owner).
 *
 * The composer is always mounted with a fixed set of passes: adding or removing it when the
 * quality tier changes re-creates the render targets and flashes the screen black. The low
 * tier only switches the (expensive) AO pass off.
 */
/** `?ao=0` turns the AO pass off (for bisecting GPU-specific flashes). */
const AO_OFF =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ao") === "0";

/** `?fx=0` removes post-processing entirely (for bisecting GPU-specific flashes). */
const FX_OFF =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fx") === "0";

export function Effects() {
  const low = useAppStore((s) => s.quality === "low") || AO_OFF;
  if (FX_OFF) return null;
  return (
    <EffectComposer multisampling={0}>
      <N8AO
        enabled={!low}
        aoRadius={1.4}
        distanceFalloff={0.8}
        intensity={2.6}
        quality="medium"
        halfRes
      />
      <Vignette offset={0.35} darkness={0.3} />
    </EffectComposer>
  );
}
