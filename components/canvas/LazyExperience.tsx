"use client";

import dynamic from "next/dynamic";

/**
 * The 3D scene (three.js, R3F, drei, postprocessing) is loaded after the page so initial
 * JS stays small (CLAUDE.md §9); the Loader covers the gap.
 */
export const LazyExperience = dynamic(() => import("./Experience").then((m) => m.Experience), {
  ssr: false,
});
