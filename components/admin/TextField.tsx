"use client";

import { useField } from "./AdminContext";
import { Field, inputClass } from "./Field";
import type { Path } from "./paths";

interface TextFieldProps {
  path: Path;
  label: string;
  hint?: string;
  type?: "text" | "email" | "url" | "number";
  multiline?: boolean;
  /** Empty input removes the key (for optional schema fields). */
  optional?: boolean;
  placeholder?: string;
}

export function TextField({
  path,
  label,
  hint,
  type = "text",
  multiline,
  optional,
  placeholder,
}: TextFieldProps) {
  const { value, error, set, id } = useField(path);
  const shown = value === undefined || value === null ? "" : String(value);
  const isTodo = shown.trim().toUpperCase().startsWith("TODO");

  const onChange = (raw: string) => {
    if (type === "number") set(raw === "" ? undefined : Number(raw));
    else if (optional && raw === "") set(undefined);
    else set(raw);
  };

  const common = {
    id,
    value: shown,
    placeholder,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `${inputClass(error)} ${isTodo ? "bg-amber-50" : ""}`,
  };

  return (
    <Field id={id} label={label} hint={isTodo ? "Placeholder — replace me" : hint} error={error}>
      {multiline ? (
        <textarea {...common} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}
