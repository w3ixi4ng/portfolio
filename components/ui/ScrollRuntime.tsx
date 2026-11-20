"use client";

import { useEffect } from "react";
import { TIMES, currentTimeOfDay, type TimeOfDay } from "@/lib/daylight";
import { scrollState, startScrollLoop } from "@/lib/scrollState";
import { useAppStore } from "@/lib/store";

/** Starts the shared scroll loop and tracks prefers-reduced-motion. Renders nothing. */
export function ScrollRuntime() {
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);
  const tod = useAppStore((s) => s.tod);

  // Dark mode "for free": the HUD goes dark with the night sky (CSS variables in globals.css).
  useEffect(() => {
    const root = document.documentElement;
    if (tod === "night") root.dataset.theme = "night";
    else delete root.dataset.theme;
    return () => {
      delete root.dataset.theme;
    };
  }, [tod]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      scrollState.reducedMotion = mq.matches;
      setReducedMotion(mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);

    // Time of day follows Singapore time. `?time=sunrise|day|golden|night` overrides it
    // (and the legacy `?night=0|1`), handy for previews and screenshots.
    const params = new URLSearchParams(window.location.search);
    const asked = params.get("time") as TimeOfDay | null;
    const legacy = params.get("night");
    const initial: TimeOfDay =
      asked && TIMES.includes(asked)
        ? asked
        : legacy !== null
          ? legacy === "1" || legacy === "true"
            ? "night"
            : "day"
          : currentTimeOfDay();
    useAppStore.getState().setTod(initial);

    // Dev-only: `/?at=0.42` pins the jump at that progress without scrolling the page
    // (headless screenshots of a scrolled page come out blank).
    if (process.env.NODE_ENV !== "production") {
      const at = Number(new URLSearchParams(window.location.search).get("at"));
      if (at > 0 && at <= 1) scrollState.pinned = at;
      // `?reserve` shows the reserve-pop easter egg already deployed.
      if (window.location.search.includes("reserve")) useAppStore.getState().setReserve(true);
      // `?drink` shows the avatar mid-kopi.
      if (window.location.search.includes("drink")) useAppStore.getState().setDrinking(true);
    }

    const stop = startScrollLoop();
    return () => {
      mq.removeEventListener("change", apply);
      stop();
    };
  }, [setReducedMotion]);

  return null;
}
