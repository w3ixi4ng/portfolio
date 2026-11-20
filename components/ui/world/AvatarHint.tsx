"use client";

import { profile, type Project } from "@/content";
import type { ZoneId } from "@/lib/scroll";
import { useAppStore } from "@/lib/store";
import { EGG_COPY } from "./eggCopy";
import { SpeechBubble } from "./SpeechBubble";

interface AvatarHintProps {
  zone: ZoneId;
  landed: boolean;
  /** The project island currently being passed, if any, and which side it's on. */
  island: { project: Project; side: -1 | 1 } | null;
  /** An easter-egg line that takes over the bubble for a moment. */
  egg: "twists" | "reserve" | "kopi" | null;
}

/**
 * The avatar's speech bubble: whenever you pass something clickable it says so, with a
 * button that does the same thing (so it's never 3D-only). UI copy lives here, not in 3D code.
 */
export function AvatarHint({ zone, landed, island, egg }: AvatarHintProps) {
  const openPanel = useAppStore((s) => s.openPanel);

  let text: React.ReactNode = null;
  let action: { label: string; run: () => void } | null = null;

  if (egg) {
    text = EGG_COPY[egg];
  } else if (landed) {
    // The contact card is already open beside me, so no extra button here.
    text = "Touched down! Tap a hangar and I'll walk you in, or grab a kopi ☕";
  } else if (zone === "freefall") {
    text = (
      <>
        Hi! I&apos;m <strong>{profile.name}</strong> 👋
      </>
    );
    action = { label: "About me", run: () => openPanel({ kind: "about" }) };
  } else if (zone === "formation") {
    text = "Each of my friends carries a skill group. Tap a sign!";
    action = { label: "Show skills", run: () => openPanel({ kind: "skills", index: 0 }) };
  } else if (zone === "islands" && island) {
    const arrow = island.side < 0 ? "👈" : "👉";
    text = (
      <>
        {arrow} Tap <strong>{island.project.title}</strong> to take a look!
      </>
    );
    action = {
      label: `Visit ${island.project.title}`,
      run: () => openPanel({ kind: "project", slug: island.project.slug }),
    };
  } else if (zone === "deployment") {
    text = "Canopy's open! The flags are places I've worked.";
    action = { label: "Flight path", run: () => openPanel({ kind: "experience", index: 0 }) };
  }

  if (!text) return null;
  return (
    <SpeechBubble>
      <p>{text}</p>
      {action && (
        <button type="button" className="btn btn-sm btn-primary mt-2" onClick={action.run}>
          {action.label}
        </button>
      )}
    </SpeechBubble>
  );
}
