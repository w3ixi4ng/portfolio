"use client";

import { settings } from "@/content";
import { sfx } from "@/lib/sound";
import { useAppStore, type EggId } from "@/lib/store";

/** Mark an easter egg as found (once) with a little chime. No-op if eggs are disabled. */
export function useEgg() {
  const findEgg = useAppStore((s) => s.findEgg);
  return (id: EggId) => {
    if (!settings.easterEggsEnabled) return;
    if (!useAppStore.getState().eggsFound.includes(id)) sfx.found();
    findEgg(id);
  };
}
