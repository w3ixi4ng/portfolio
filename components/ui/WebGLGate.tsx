"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { PlainContent } from "./PlainContent";

let cached: boolean | null = null;
const noopSubscribe = () => () => {};

function hasWebGL() {
  if (cached !== null) return cached;
  try {
    const c = document.createElement("canvas");
    cached = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    cached = false;
  }
  return cached;
}

/** WebGL unavailable → automatically show the plain portfolio instead (CLAUDE.md §8). */
export function WebGLGate({ children }: { children: ReactNode }) {
  // Server render assumes WebGL; the client checks once after hydration.
  const supported = useSyncExternalStore(noopSubscribe, hasWebGL, () => true);

  if (supported) return <>{children}</>;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper px-4 py-10">
      <PlainContent
        backLink={
          <p className="card-inset p-3 text-sm font-semibold">
            Your browser can&apos;t show the 3D skydive, so here&apos;s everything in plain form.
          </p>
        }
      />
    </div>
  );
}
