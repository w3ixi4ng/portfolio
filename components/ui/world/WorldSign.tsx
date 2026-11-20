"use client";

import type { ReactNode } from "react";

export type SignTone = "red" | "navy" | "cream" | "teal";

interface WorldSignProps {
  label: string;
  /** Small line under the label (e.g. dates). */
  sub?: string;
  icon?: ReactNode;
  onClick: () => void;
  /** Accessible description of what clicking does. */
  actionLabel?: string;
  tone?: SignTone;
}

const TONE: Record<SignTone, string> = {
  red: "shop-sign-red",
  navy: "shop-sign-navy",
  cream: "shop-sign-cream",
  teal: "shop-sign-teal",
};

/**
 * A painted shop sign on a little pole, pinned in the 3D world (design/STYLE.md §9).
 * Real HTML, so it's focusable and readable; clicking opens a detail panel.
 */
export function WorldSign({
  label,
  sub,
  icon,
  onClick,
  actionLabel,
  tone = "red",
}: WorldSignProps) {
  return (
    <div className="bob flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={actionLabel ?? label}
        className={`shop-sign ${TONE[tone]} cursor-pointer whitespace-nowrap transition-transform hover:-translate-y-0.5 active:scale-95`}
      >
        <span className="flex items-center gap-1.5 text-[13px] leading-tight">
          {icon}
          {label}
        </span>
        {sub && (
          <span className="block text-[10px] font-semibold tracking-normal normal-case opacity-90">
            {sub}
          </span>
        )}
      </button>
      <span aria-hidden="true" className="h-4 w-1 rounded-b bg-[#8a8478]" />
    </div>
  );
}
