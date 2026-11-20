"use client";

import { useAdmin } from "./AdminContext";
import { inputClass } from "./Field";
import { getIn, move, pathKey, type Path } from "./paths";
import { ReorderButtons } from "./ReorderButtons";

interface StringListFieldProps {
  path: Path;
  label: string;
  itemLabel?: string;
  hint?: string;
}

/** Editable list of strings with add / delete / reorder. */
export function StringListField({ path, label, itemLabel = "item", hint }: StringListFieldProps) {
  const { data, update, errors } = useAdmin();
  const raw = getIn(data, path);
  const items = Array.isArray(raw) ? raw.map((v) => String(v)) : [];
  const listError = errors[pathKey(path)];
  const groupId = `f-${pathKey(path).replace(/\./g, "-")}`;

  return (
    <fieldset className="space-y-2" aria-describedby={hint ? `${groupId}-hint` : undefined}>
      <legend className="text-sm font-semibold">{label}</legend>
      {hint && (
        <p id={`${groupId}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {listError && <p className="text-sm font-semibold text-[#B3261E]">{listError}</p>}
      <ol className="space-y-2">
        {items.map((item, i) => {
          const err = errors[pathKey([...path, i])];
          const id = `${groupId}-${i}`;
          const todo = item.trim().toUpperCase().startsWith("TODO");
          return (
            <li key={i}>
              <div className="flex items-start gap-2">
                <label htmlFor={id} className="sr-only">
                  {`${itemLabel} ${i + 1}`}
                </label>
                <textarea
                  id={id}
                  rows={item.length > 70 ? 2 : 1}
                  className={`${inputClass(err)} ${todo ? "bg-amber-50" : ""} resize-y`}
                  value={item}
                  aria-invalid={!!err}
                  onChange={(e) => update([...path, i], e.target.value)}
                />
                <ReorderButtons
                  index={i}
                  count={items.length}
                  label={`${itemLabel} ${i + 1}`}
                  onMove={(to) => update(path, move(items, i, to))}
                  onDelete={() =>
                    update(
                      path,
                      items.filter((_, j) => j !== i),
                    )
                  }
                />
              </div>
              {err && <p className="mt-1 text-sm font-semibold text-[#B3261E]">{err}</p>}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        className="adm-btn adm-btn-sm"
        onClick={() => update(path, [...items, ""])}
      >
        + Add {itemLabel}
      </button>
    </fieldset>
  );
}
