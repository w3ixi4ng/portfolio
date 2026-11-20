"use client";

import { useState, type ReactNode } from "react";
import { useAdmin } from "./AdminContext";
import { getIn, move, pathKey, type Path } from "./paths";
import { ReorderButtons } from "./ReorderButtons";

interface ListEditorProps<T> {
  path: Path;
  /** Singular noun for buttons, e.g. "project". */
  noun: string;
  makeNew: () => T;
  title: (item: T, index: number) => string;
  children: (itemPath: Path, index: number) => ReactNode;
}

/** Collapsible cards for a list of objects, with add / delete / reorder. */
export function ListEditor<T>({ path, noun, makeNew, title, children }: ListEditorProps<T>) {
  const { data, update, errors } = useAdmin();
  const raw = getIn(data, path);
  const items = (Array.isArray(raw) ? raw : []) as T[];
  const [open, setOpen] = useState<number | null>(0);

  const errorCount = (i: number) => {
    const prefix = `${pathKey([...path, i])}.`;
    return Object.keys(errors).filter((k) => k.startsWith(prefix) || k === prefix.slice(0, -1))
      .length;
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        const nErr = errorCount(i);
        const label = title(item, i) || `${noun} ${i + 1}`;
        return (
          <section key={i} className="rounded-lg border border-border bg-white">
            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left font-semibold"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                <span>{label}</span>
                {nErr > 0 && (
                  <span className="rounded-full bg-[#B3261E] px-2 text-xs text-white">
                    {nErr} error{nErr > 1 ? "s" : ""}
                  </span>
                )}
              </button>
              <ReorderButtons
                index={i}
                count={items.length}
                label={label}
                onMove={(to) => {
                  update(path, move(items, i, to));
                  if (isOpen) setOpen(to);
                }}
                onDelete={() => {
                  if (!window.confirm(`Delete "${label}"?`)) return;
                  update(
                    path,
                    items.filter((_, j) => j !== i),
                  );
                  setOpen(null);
                }}
              />
            </div>
            {isOpen && (
              <div className="space-y-4 border-t border-border bg-[#FAFBFC] p-4">
                {children([...path, i], i)}
              </div>
            )}
          </section>
        );
      })}
      <button
        type="button"
        className="adm-btn"
        onClick={() => {
          update(path, [...items, makeNew()]);
          setOpen(items.length);
        }}
      >
        + Add {noun}
      </button>
    </div>
  );
}
