"use client";

import type { ReactNode } from "react";

/** Comic speech bubble above a character. Content is real HTML (buttons allowed). */
export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="bubble bob mb-3 max-w-64 px-4 py-2.5 text-center text-sm font-semibold">
      {children}
    </div>
  );
}
