"use client";

import { createContext, useContext } from "react";
import type { Portfolio } from "@/content/schema";
import { getIn, pathKey, type Path } from "./paths";

export interface AdminContextValue {
  data: Portfolio;
  update: (path: Path, value: unknown) => void;
  errors: Record<string, string>;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminContext>");
  return ctx;
}

/** Value + error + setter for one field path. */
export function useField(path: Path) {
  const { data, update, errors } = useAdmin();
  return {
    value: getIn(data, path),
    error: errors[pathKey(path)],
    set: (v: unknown) => update(path, v),
    id: `f-${pathKey(path).replace(/\./g, "-")}`,
  };
}
