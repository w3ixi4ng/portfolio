"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { portfolioSchema, type Portfolio } from "@/content/schema";
import { AdminContext } from "./AdminContext";
import { pathKey, setIn, type Path } from "./paths";
import { EducationTab } from "./tabs/EducationTab";
import { ExperienceTab } from "./tabs/ExperienceTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { SkillsTab } from "./tabs/SkillsTab";

type TabKey = keyof Portfolio;

const TABS: { key: TabKey; label: string; Component: ComponentType }[] = [
  { key: "profile", label: "Profile", Component: ProfileTab },
  { key: "education", label: "Education", Component: EducationTab },
  { key: "experience", label: "Experience", Component: ExperienceTab },
  { key: "projects", label: "Projects", Component: ProjectsTab },
  { key: "skills", label: "Skills", Component: SkillsTab },
  { key: "settings", label: "Settings", Component: SettingsTab },
];

type Status =
  | { kind: "loading" }
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

interface Issue {
  path: (string | number)[];
  message: string;
}

const toErrors = (issues: readonly { path: readonly PropertyKey[]; message: string }[]) => {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = pathKey(i.path.map((p) => (typeof p === "number" ? p : String(p))));
    out[key] ??= i.message;
  }
  return out;
};

/** The dev-only editor for content/portfolio.json. */
export function AdminEditor() {
  const [data, setData] = useState<Portfolio | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<TabKey>("profile");
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (!r.ok) throw new Error(`GET /api/admin → ${r.status}`);
        return r.json() as Promise<Portfolio>;
      })
      .then((json) => {
        setData(json);
        setStatus({ kind: "idle" });
      })
      .catch((e: unknown) => setStatus({ kind: "error", message: String(e) }));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = useCallback((path: Path, value: unknown) => {
    setData((d) => (d ? setIn(d, path, value) : d));
    setDirty(true);
    setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s));
    // Clear the error for this field (and anything under it) as soon as it's edited.
    const key = pathKey(path);
    setErrors((errs) => {
      const next = Object.fromEntries(
        Object.entries(errs).filter(([k]) => k !== key && !k.startsWith(`${key}.`)),
      );
      return Object.keys(next).length === Object.keys(errs).length ? errs : next;
    });
  }, []);

  const ctx = useMemo(() => (data ? { data, update, errors } : null), [data, update, errors]);

  const errorCountFor = (key: TabKey) =>
    Object.keys(errors).filter((k) => k === key || k.startsWith(`${key}.`)).length;

  async function save() {
    if (!data) return;
    const result = portfolioSchema.safeParse(data);
    if (!result.success) {
      const errs = toErrors(result.error.issues);
      setErrors(errs);
      const firstTab = TABS.find((t) => Object.keys(errs).some((k) => k.split(".")[0] === t.key));
      if (firstTab) setTab(firstTab.key);
      setStatus({
        kind: "error",
        message: `Fix ${Object.keys(errs).length} error(s) before saving.`,
      });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (res.status === 422) {
        const body = (await res.json()) as { issues: Issue[] };
        setErrors(toErrors(body.issues));
        setStatus({ kind: "error", message: "The server rejected some fields." });
        return;
      }
      if (!res.ok) throw new Error(`PUT /api/admin → ${res.status}`);
      setErrors({});
      setDirty(false);
      setStatus({ kind: "saved" });
    } catch (e) {
      setStatus({ kind: "error", message: String(e) });
    }
  }

  const Active = TABS.find((t) => t.key === tab)?.Component ?? ProfileTab;

  const activeLabel = TABS.find((t) => t.key === tab)?.label;

  return (
    <div className="adm min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-base font-bold">Content editor</h1>
            <p role="note" className="text-xs text-ink-soft">
              Local only. Saves to content/portfolio.json, commit to publish.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div aria-live="polite" className="text-xs font-semibold">
              {status.kind === "saved" && <span className="text-[#1F6F4A]">Saved</span>}
              {status.kind === "error" && <span className="text-[#B3261E]">{status.message}</span>}
              {status.kind === "idle" && dirty && (
                <span className="text-ink-soft">Unsaved changes</span>
              )}
            </div>
            <button
              type="button"
              className="adm-btn"
              onClick={() => window.open("/", "_blank", "noopener")}
            >
              Preview
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={save}
              disabled={!data || status.kind === "saving"}
            >
              {status.kind === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[180px_1fr]">
        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto md:flex-col">
          {TABS.map((t) => {
            const n = errorCountFor(t.key);
            return (
              <button
                key={t.key}
                type="button"
                aria-current={tab === t.key ? "page" : undefined}
                onClick={() => setTab(t.key)}
                className={`adm-nav ${tab === t.key ? "adm-nav-active" : ""}`}
              >
                {t.label}
                {n > 0 && (
                  <span
                    className="ml-auto rounded-full bg-[#B3261E] px-1.5 text-[11px] text-white"
                    aria-label={`${n} errors`}
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <section className="rounded-lg border border-border bg-white p-5" aria-label={activeLabel}>
          <h2 className="mb-4 text-lg font-bold">{activeLabel}</h2>
          {status.kind === "loading" && <p>Loading…</p>}
          {ctx && (
            <AdminContext value={ctx}>
              <Active />
            </AdminContext>
          )}
        </section>
      </div>
    </div>
  );
}
