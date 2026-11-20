"use client";

import { islandThemes, type Project } from "@/content/schema";
import { ImagePathField } from "../ImagePathField";
import { ListEditor } from "../ListEditor";
import { SelectField } from "../SelectField";
import { StringListField } from "../StringListField";
import { TextField } from "../TextField";
import { ToggleField } from "../ToggleField";

const blank = (): Project => ({
  slug: "",
  title: "",
  tagline: "",
  description: "",
  highlights: [],
  role: "",
  stack: [],
  year: new Date().getFullYear(),
  links: {},
  thumbnail: "",
  islandTheme: "forest",
});

export function ProjectsTab() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">Each project is a floating island, in this order.</p>
      <ListEditor<Project>
        path={["projects"]}
        noun="project"
        makeNew={blank}
        title={(p) => p.title}
      >
        {(p) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField path={[...p, "title"]} label="Title" />
              <TextField
                path={[...p, "slug"]}
                label="Slug"
                hint="Lowercase, dashes. Used as an id."
                placeholder="my-project"
              />
            </div>
            <TextField path={[...p, "tagline"]} label="Tagline" />
            <TextField path={[...p, "badge"]} label="Badge / award (optional)" optional />
            <TextField path={[...p, "description"]} label="Description" multiline />
            <StringListField path={[...p, "highlights"]} label="Highlights" itemLabel="highlight" />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField path={[...p, "role"]} label="Role" />
              <TextField path={[...p, "year"]} label="Year" type="number" />
              <TextField
                path={[...p, "period"]}
                label="Period (optional)"
                optional
                placeholder="Jan – May 2026"
              />
            </div>
            <StringListField path={[...p, "stack"]} label="Stack" itemLabel="technology" />
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-1 font-semibold">Links (leave blank to hide)</legend>
              <TextField path={[...p, "links", "live"]} label="Live demo" type="url" optional />
              <TextField path={[...p, "links", "repo"]} label="Repository" type="url" optional />
              <TextField
                path={[...p, "links", "caseStudy"]}
                label="Case study"
                type="url"
                optional
              />
            </fieldset>
            <ImagePathField path={[...p, "thumbnail"]} label="Thumbnail" />
            <div className="grid items-end gap-4 sm:grid-cols-2">
              <SelectField
                path={[...p, "islandTheme"]}
                label="Island theme"
                options={islandThemes}
              />
              <ToggleField
                path={[...p, "featured"]}
                label="Featured"
                hint="Gets a little flag on its island."
              />
            </div>
          </>
        )}
      </ListEditor>
    </div>
  );
}
