"use client";

import type { Education } from "@/content/schema";
import { ListEditor } from "../ListEditor";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";

const blank = (): Education => ({ school: "", degree: "", start: "", end: "", highlights: [] });

export function EducationTab() {
  return (
    <ListEditor<Education>
      path={["education"]}
      noun="school"
      makeNew={blank}
      title={(e) => e.school}
    >
      {(p) => (
        <>
          <TextField path={[...p, "school"]} label="School" />
          <TextField path={[...p, "degree"]} label="Degree" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField path={[...p, "start"]} label="Start" placeholder="Aug 2024" />
            <TextField path={[...p, "end"]} label="End" placeholder="Apr 2028" />
          </div>
          <StringListField path={[...p, "highlights"]} label="Highlights" itemLabel="highlight" />
        </>
      )}
    </ListEditor>
  );
}
