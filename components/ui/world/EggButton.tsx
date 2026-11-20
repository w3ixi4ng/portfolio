"use client";

/**
 * Keyboard path to a 3D easter egg (CLAUDE.md §8): invisible until focused, then shows as
 * a small pill pinned at the egg.
 */
export function EggButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-sm btn-cream sr-only rounded-full! focus:not-sr-only"
    >
      {label}
    </button>
  );
}
