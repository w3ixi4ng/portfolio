"use client";

import { useField } from "./AdminContext";
import { Field, inputClass } from "./Field";
import type { Path } from "./paths";

export function ColorField({ path, label, hint }: { path: Path; label: string; hint?: string }) {
  const { value, error, set, id } = useField(path);
  const hex = typeof value === "string" ? value : "";
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex);

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? hex : "#000000"}
          onChange={(e) => set(e.target.value.toUpperCase())}
          className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-white"
        />
        <input
          id={id}
          className={inputClass(error)}
          value={hex}
          onChange={(e) => set(e.target.value)}
        />
      </div>
    </Field>
  );
}
