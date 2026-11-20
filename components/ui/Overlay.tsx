"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatAltitude, getZone, type ZoneId } from "@/lib/scroll";
import { useAppStore } from "@/lib/store";
import { Altimeter } from "./Altimeter";
import { EggCounter } from "./EggCounter";
import { PanelHost } from "./PanelHost";
import { TimeToggle } from "./TimeToggle";
import { SoundToggle } from "./SoundToggle";
import { AboutCard } from "./cards/AboutCard";
import { ExperienceCard } from "./cards/ExperienceCard";
import { HeroCard } from "./cards/HeroCard";
import { ProjectsCard } from "./cards/ProjectsCard";
import { SkillsCard } from "./cards/SkillsCard";
import { ZoneCard } from "./cards/ZoneCard";
import { ContactPanel } from "./panels/ContactPanel";

type CardZone = Exclude<ZoneId, "plane">;

/** Card title + body per zone. UI copy only; personal content comes from /content. */
const CARDS: Record<CardZone, { title: string; alt: number; body: () => ReactNode }> = {
  freefall: { title: "About me", alt: 12000, body: () => <AboutCard /> },
  formation: { title: "Skills formation", alt: 9000, body: () => <SkillsCard /> },
  islands: { title: "Projects", alt: 6000, body: () => <ProjectsCard /> },
  deployment: { title: "Flight path", alt: 3000, body: () => <ExperienceCard /> },
  dropzone: { title: "Get in touch", alt: 1000, body: () => <ContactPanel /> },
};

/**
 * HTML HUD over the canvas (design/STYLE.md §9): pill top bar, altimeter, and the zone's
 * content card beside the avatar. In-world shop signs are extra labels, not the only path.
 */
export function Overlay() {
  const activeZone = useAppStore((s) => s.activeZone);
  const reduce = useAppStore((s) => s.reducedMotion);
  const openPanel = useAppStore((s) => s.openPanel);
  const ready = useAppStore((s) => s.scrollReady);

  const pop = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 24, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.97 },
      };
  const transition = reduce
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  const card = activeZone === "plane" ? null : CARDS[activeZone];

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <div className="pill pointer-events-auto absolute top-3 right-3 flex items-center gap-1.5 p-1.5 sm:top-5 sm:right-5">
        <button
          type="button"
          className="btn btn-sm btn-primary rounded-full!"
          onClick={() => openPanel({ kind: "contact" })}
        >
          Contact
        </button>
        <Link href="/plain" className="btn btn-sm btn-cream gap-0! rounded-full!">
          Skip<span className="hidden sm:inline">&nbsp;the jump</span>
        </Link>
        <TimeToggle />
        <SoundToggle />
      </div>

      {/* Hero: left of the plane on desktop, under the top bar on phones. */}
      <div className="absolute inset-x-3 top-20 flex justify-center sm:inset-x-auto sm:top-20 sm:left-[5vw]">
        {/* Before the scroll runtime knows the real zone, the server-rendered hero is static
            (no enter animation to get stuck mid-way if the page loads mid-jump). */}
        {!ready && (
          <div className="pointer-events-auto w-full">
            <HeroCard />
          </div>
        )}
        <AnimatePresence initial={false}>
          {ready && activeZone === "plane" && (
            <motion.div
              key="hero"
              className="pointer-events-auto w-full"
              {...pop}
              transition={transition}
            >
              <HeroCard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zone card beside the avatar: right on desktop, bottom on phones. */}
      <div className="absolute inset-x-3 bottom-3 flex justify-center sm:inset-x-auto sm:top-0 sm:right-5 sm:bottom-0 sm:items-center">
        <AnimatePresence mode="wait" initial={false}>
          {ready && card && (
            <motion.div
              key={activeZone}
              className="pointer-events-auto w-full sm:w-auto"
              {...pop}
              transition={transition}
            >
              <ZoneCard
                eyebrow={`${getZone(activeZone).label} · ${formatAltitude(card.alt)} ft`}
                title={card.title}
              >
                {card.body()}
              </ZoneCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EggCounter />
      {/* Site footer: model credits (CLAUDE.md §3). */}
      <Link
        href="/plain#credits"
        className="pointer-events-auto absolute right-3 bottom-1 hidden text-[11px] font-semibold text-ink/60 underline hover:text-ink sm:block"
      >
        3D model credits
      </Link>
      <Altimeter />
      <PanelHost />
    </div>
  );
}
