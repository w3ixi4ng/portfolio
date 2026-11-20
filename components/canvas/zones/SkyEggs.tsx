"use client";

import { CameraFlyerEgg } from "./CameraFlyerEgg";
import { PigeonEgg } from "./PigeonEgg";

/** Easter eggs that live in the sky (CLAUDE.md §5 #2 pigeon, #3 camera-flyer selfie). */
export function SkyEggs() {
  return (
    <>
      <PigeonEgg />
      <CameraFlyerEgg />
    </>
  );
}
