"use client";

import { useAppStore } from "@/lib/store";

/** Sound is opt-in. No audio is wired up yet; this only holds the preference. */
export function SoundToggle() {
  const soundOn = useAppStore((s) => s.soundOn);
  const toggle = useAppStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      className="btn btn-round btn-cream h-8! w-8!"
      aria-pressed={soundOn}
      aria-label={soundOn ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      onClick={toggle}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
        <path
          d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {soundOn ? (
          <path
            d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M16 9.5l5 5M21 9.5l-5 5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
