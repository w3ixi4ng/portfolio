"use client";

import { profile } from "@/content";
import { scrollTargetForZone } from "@/lib/scroll";
import { scrollToProgress } from "@/lib/scrollState";

export function HeroCard() {
  return (
    <div className="card w-full max-w-sm p-6">
      <p className="text-[11px] font-extrabold tracking-[0.18em] text-ink-soft uppercase">
        13,000 ft · door open
      </p>
      <h1 className="mt-1 font-display text-4xl leading-tight font-bold">{profile.name}</h1>
      <p className="mt-1 font-display text-lg font-semibold text-teal-ink">{profile.title}</p>
      <p className="mt-3">{profile.pitch}</p>
      <button
        type="button"
        className="btn btn-primary mt-5"
        onClick={() => scrollToProgress(scrollTargetForZone("freefall"))}
      >
        Scroll to jump <span aria-hidden="true">↓</span>
      </button>
    </div>
  );
}
