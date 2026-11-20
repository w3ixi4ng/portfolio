"use client";

import { useField } from "./AdminContext";
import { Field, inputClass } from "./Field";
import type { Path } from "./paths";

interface SelectFieldProps {
  path: Path;
  label: string;
  options: readonly string[];
  hint?: string;
}

export function SelectField({ path, label, options, hint }: SelectFieldProps) {
  const { value, error, set, id } = useField(path);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        className={inputClass(error)}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => set(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}
