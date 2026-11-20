"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  ZONES,
  altitudeFromScroll,
  formatAltitude,
  getZone,
  scrollTargetForZone,
} from "@/lib/scroll";
import { onScrollFrame, scrollToProgress } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";

/** One needle revolution = 12,000 ft, like a real skydiving altimeter. */
const FT_PER_REV = 12000;

function Dial({ size, needleRef }: { size: number; needleRef: RefObject<SVGGElement | null> }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      {/* brass bezel + face */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="var(--canopy-yellow)"
        stroke="var(--ink)"
        strokeWidth="3"
      />
      <circle cx="32" cy="32" r="25" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="32"
          y1="9"
          x2="32"
          y2={i % 3 === 0 ? 14 : 12}
          stroke="var(--ink)"
          strokeWidth={i % 3 === 0 ? 3 : 1.8}
          strokeLinecap="round"
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
      {/* red arc: 0 → 3,000 ft, the deployment band (12 → 3 o'clock) */}
      <path d="M32 9 A23 23 0 0 1 55 32" fill="none" stroke="var(--canopy-red)" strokeWidth="3.5" />
      <g ref={needleRef} style={{ transformOrigin: "32px 32px" }}>
        <path d="M32 13 L35 34 L29 34 Z" fill="var(--ink)" />
      </g>
      <circle
        cx="32"
        cy="32"
        r="4"
        fill="var(--canopy-yellow)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Wrist-mounted altimeter HUD in a wooden case. Doubles as navigation: each zone marker
 * smooth-scrolls there. Readout + needle update via refs (no per-frame React renders).
 */
export function Altimeter() {
  const activeZone = useAppStore((s) => s.activeZone);
  const readoutSmall = useRef<HTMLSpanElement>(null);
  const readoutLarge = useRef<HTMLSpanElement>(null);
  const needleSmall = useRef<SVGGElement>(null);
  const needleLarge = useRef<SVGGElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(
    () =>
      onScrollFrame((t) => {
        const alt = altitudeFromScroll(t);
        const text = formatAltitude(alt);
        for (const el of [readoutSmall.current, readoutLarge.current]) {
          if (el) el.textContent = text;
        }
        const deg = (alt / FT_PER_REV) * 360;
        for (const n of [needleSmall.current, needleLarge.current]) {
          if (n) n.style.transform = `rotate(${deg}deg)`;
        }
      }),
    [],
  );

  const markers = (
    <ol className="mt-3 grid gap-1">
      {ZONES.map((z) => {
        const current = z.id === activeZone;
        return (
          <li key={z.id}>
            <button
              type="button"
              onClick={() => {
                scrollToProgress(scrollTargetForZone(z.id));
                setExpanded(false);
              }}
              aria-current={current ? "step" : undefined}
              className={`btn btn-sm w-full justify-start! py-1! text-[13px]! ${current ? "bg-canopy-yellow! hover:bg-canopy-yellow!" : "btn-cream"}`}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full border-2 border-ink ${current ? "bg-canopy-red" : "bg-paper"}`}
              />
              {z.label}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <nav
      aria-label="Altimeter: jump to a zone"
      className="pointer-events-auto absolute top-3 left-3 sm:top-auto sm:bottom-5 sm:left-5"
    >
      {/* Compact pill (small screens) */}
      <div className="sm:hidden">
        <button
          type="button"
          className="pill flex items-center gap-2 py-1 pr-4 pl-1"
          aria-expanded={expanded}
          aria-controls="altimeter-zones"
          onClick={() => setExpanded((v) => !v)}
        >
          <Dial size={36} needleRef={needleSmall} />
          <span className="font-display text-lg font-bold tabular-nums">
            <span ref={readoutSmall}>13,000</span>
            <span className="ml-1 text-xs">ft</span>
          </span>
          <span className="text-xs font-bold text-ink-soft">{getZone(activeZone).label}</span>
        </button>
        {expanded && (
          <div id="altimeter-zones" className="card mt-2 w-52 p-3">
            {markers}
          </div>
        )}
      </div>

      {/* Full wrist unit */}
      <div className="card hidden w-56 p-4 sm:block">
        <div className="flex items-center gap-3">
          <Dial size={72} needleRef={needleLarge} />
          <div className="card-inset px-2.5 py-1.5">
            <span className="block font-display text-2xl leading-none font-bold tabular-nums">
              <span ref={readoutLarge}>13,000</span>
              <span className="ml-1 text-xs font-semibold text-ink-soft">ft</span>
            </span>
          </div>
        </div>
        {markers}
      </div>
    </nav>
  );
}
