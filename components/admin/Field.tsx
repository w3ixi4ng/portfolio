import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label + hint + field-level error wrapper. */
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (error?: string) =>
  `w-full rounded-md border bg-white px-3 py-1.5 text-sm ${error ? "border-[#B3261E]" : "border-border"} focus:border-teal-ink focus:outline-none`;
