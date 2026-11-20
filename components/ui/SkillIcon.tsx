"use client";

import { useEffect, useState } from "react";
import type { SkillIconData } from "@/lib/skillIcons.generated";

type Icons = Record<string, SkillIconData>;
let cache: Icons | null = null;
let pending: Promise<Icons> | null = null;

/** The icon data is a separate chunk, loaded the first time a skills list is shown. */
function useIcons(): Icons | null {
  const [icons, setIcons] = useState<Icons | null>(cache);
  useEffect(() => {
    if (cache) return;
    pending ??= import("@/lib/skillIcons.generated").then((m) => (cache = m.SKILL_ICONS));
    let alive = true;
    pending.then((i) => alive && setIcons(i));
    return () => {
      alive = false;
    };
  }, []);
  return icons;
}

/** Brands that asked not to be in Simple Icons (and generic tech): drawn badges instead. */
const BADGES: Record<string, { label: string; bg: string; fg?: string }> = {
  aws: { label: "AWS", bg: "#FF9900", fg: "#232F3E" },
  azure: { label: "Az", bg: "#0078D4" },
  openshift: { label: "OS", bg: "#EE0000" },
};

function Glyph({ name }: { name: string }) {
  const k = name.toLowerCase();
  if (k === "sql") {
    // a database cylinder
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="#336791"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="5.5" rx="7" ry="2.8" />
        <path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
      </svg>
    );
  }
  if (k === "websocket") {
    // two arrows: full duplex
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="#2B2A30"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />
      </svg>
    );
  }
  const b = Object.entries(BADGES).find(([key]) => k.includes(key))?.[1];
  const label = b?.label ?? name.slice(0, 2);
  return (
    <span
      className="flex h-full w-full items-center justify-center rounded-[5px] text-[8px] leading-none font-extrabold"
      style={{ background: b?.bg ?? "#6E6C86", color: b?.fg ?? "#fff" }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

/** A skill's logo on a small white tile (reads on both the light and dark HUD). */
export function SkillIcon({ name, size = 24 }: { name: string; size?: number }) {
  const icons = useIcons();
  const data = icons?.[name.toLowerCase()];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md bg-white p-[3px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {data ? (
        <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
          <path d={data.path} fill={`#${data.hex === "000000" ? "2B2A30" : data.hex}`} />
        </svg>
      ) : (
        <Glyph name={name} />
      )}
    </span>
  );
}
