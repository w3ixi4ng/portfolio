"use client";

import { useState } from "react";
import { useField } from "./AdminContext";
import { Field, inputClass } from "./Field";
import type { Path } from "./paths";

/** Path into /public with a live preview (or a "not found" note). */
export function ImagePathField({ path, label }: { path: Path; label: string }) {
  const { value, error, set, id } = useField(path);
  const src = typeof value === "string" ? value : "";
  const previewable = src.startsWith("/");
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint='Put the file in /public and enter its path, e.g. "/projects/bidly.png".'
    >
      <input
        id={id}
        className={inputClass(error)}
        value={src}
        onChange={(e) => set(e.target.value)}
        aria-invalid={!!error}
      />
      <div className="mt-2 flex aspect-video w-full max-w-xs items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-cloud text-center text-xs text-ink-soft">
        {previewable && !failed ? (
          // Plain <img>: arbitrary local preview, not worth next/image config here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Preview"
            className="h-full w-full object-cover"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <span className="p-3">{previewable ? `Not found: public${src}` : "No image yet"}</span>
        )}
      </div>
    </Field>
  );
}
