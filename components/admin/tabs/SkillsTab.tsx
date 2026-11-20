"use client";

import type { SkillGroup } from "@/content/schema";
import { ListEditor } from "../ListEditor";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";

export function SkillsTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">Each group gets its own jumper in the formation.</p>
      <ListEditor<SkillGroup>
        path={["skills"]}
        noun="group"
        makeNew={() => ({ group: "", items: [] })}
        title={(g) => g.group}
      >
        {(p) => (
          <>
            <TextField path={[...p, "group"]} label="Group name" />
            <StringListField path={[...p, "items"]} label="Skills" itemLabel="skill" />
          </>
        )}
      </ListEditor>
    </div>
  );
}
