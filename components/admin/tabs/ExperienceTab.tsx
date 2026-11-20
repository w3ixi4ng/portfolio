"use client";

import type { Experience } from "@/content/schema";
import { ListEditor } from "../ListEditor";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";

const blank = (): Experience => ({
  company: "",
  role: "",
  start: "",
  end: "",
  summary: "",
  bullets: [],
});

export function ExperienceTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        Newest first. These become waypoints on the canopy flight.
      </p>
      <ListEditor<Experience>
        path={["experience"]}
        noun="role"
        makeNew={blank}
        title={(e) => [e.role, e.company].filter(Boolean).join(" · ")}
      >
        {(p) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField path={[...p, "company"]} label="Company" />
              <TextField path={[...p, "team"]} label="Team (optional)" optional />
            </div>
            <TextField path={[...p, "role"]} label="Role" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField path={[...p, "start"]} label="Start" placeholder="May 2026" />
              <TextField path={[...p, "end"]} label="End" placeholder="Dec 2026" />
            </div>
            <TextField path={[...p, "summary"]} label="One-line summary" multiline />
            <StringListField path={[...p, "bullets"]} label="What I did" itemLabel="bullet" />
          </>
        )}
      </ListEditor>
    </div>
  );
}
