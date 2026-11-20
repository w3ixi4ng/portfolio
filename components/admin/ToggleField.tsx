"use client";

import { useField } from "./AdminContext";
import type { Path } from "./paths";

interface ToggleFieldProps {
  path: Path;
  label: string;
  hint?: string;
}

export function ToggleField({ path, label, hint }: ToggleFieldProps) {
  const { value, set, id, error } = useField(path);
  const on = value === true;

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p id={`${id}-label`} className="text-sm font-semibold">
          {label}
        </p>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        {error && <p className="text-sm font-semibold text-[#B3261E]">{error}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        onClick={() => set(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#26458C]" : "bg-[#C5CBD3]"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
