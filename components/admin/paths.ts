/** Tiny immutable path helpers for the admin form. */

export type Path = readonly (string | number)[];

export const pathKey = (path: Path) => path.join(".");

export function getIn(obj: unknown, path: Path): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const source = (obj ?? (typeof head === "number" ? [] : {})) as
    unknown[] | Record<string, unknown>;
  const child = getIn(source, [head]);
  const next = setIn(child, rest, value);

  if (Array.isArray(source)) {
    const copy = source.slice();
    copy[head as number] = next;
    return copy as T;
  }
  const copy: Record<string, unknown> = { ...source };
  if (next === undefined) delete copy[head as string];
  else copy[head as string] = next;
  return copy as T;
}

export function move<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = list.slice();
  if (to < 0 || to >= copy.length) return copy;
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
